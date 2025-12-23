#!/usr/bin/env python3
"""
Script para cargar las 3 carteras desde el archivo XLSX a la base de datos PostgreSQL
"""

import pandas as pd
import psycopg2
from datetime import datetime
import sys

# Configuración de la base de datos
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'stoxy',
    'user': 'postgres',
    'password': 'postgres123'
}

# Mapeo de carteras a user_id
PORTFOLIO_MAPPING = {
    'Francisco': 1,
    'Jaime': 2,
    'Adela': 3
}

def connect_db():
    """Conectar a la base de datos"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"❌ Error conectando a la base de datos: {e}")
        sys.exit(1)

def load_excel_data(filepath):
    """Cargar datos del archivo Excel"""
    try:
        df = pd.read_excel(filepath)
        # Eliminar filas vacías (donde Id es NaN)
        df_clean = df.dropna(subset=['Id'])
        print(f"✅ Archivo Excel cargado: {len(df_clean)} registros")
        return df_clean
    except Exception as e:
        print(f"❌ Error leyendo el archivo Excel: {e}")
        sys.exit(1)

def create_portfolios(conn):
    """Crear las 3 carteras en la tabla portfolio"""
    cursor = conn.cursor()
    
    for portfolio_name, user_id in PORTFOLIO_MAPPING.items():
        try:
            cursor.execute("""
                INSERT INTO portfolio (user_id, total_value, today_gain, today_gain_percent, stocks, crypto, created_at, updated_at)
                VALUES (%s, 0, 0, 0, 0, 0, NOW(), NOW())
                ON CONFLICT (user_id) DO NOTHING
            """, (user_id,))
            print(f"✅ Cartera '{portfolio_name}' creada (user_id: {user_id})")
        except Exception as e:
            print(f"❌ Error creando cartera '{portfolio_name}': {e}")
    
    conn.commit()
    cursor.close()

def parse_price(price_value):
    """Parsear el precio, manejando diferentes formatos"""
    if pd.isna(price_value):
        return 0.0
    
    # Si es un timestamp/datetime, extraer solo el número
    if isinstance(price_value, (pd.Timestamp, datetime)):
        # Parece que algunos precios están mal formateados como fechas
        # Intentar extraer el valor numérico
        return 0.0
    
    try:
        return float(price_value)
    except:
        return 0.0

def load_holdings(conn, df):
    """Cargar todas las posiciones (holdings) en la base de datos"""
    cursor = conn.cursor()
    
    # Agrupar por Portfolio y Symbol para consolidar transacciones
    holdings_summary = {}
    
    for _, row in df.iterrows():
        portfolio = row['Portfolio']
        symbol = row['Symbol']
        user_id = PORTFOLIO_MAPPING.get(portfolio)
        
        if not user_id:
            continue
        
        key = (user_id, symbol)
        
        if key not in holdings_summary:
            holdings_summary[key] = {
                'user_id': user_id,
                'symbol': symbol,
                'name': row['Name'],
                'quantity': 0.0,
                'total_cost': 0.0,
                'transactions': []
            }
        
        # Procesar transacción
        transaction = row['Transaction']
        quantity = float(row['Quantity']) if not pd.isna(row['Quantity']) else 0.0
        price = parse_price(row['Price'])
        
        if transaction == 'BUY':
            holdings_summary[key]['quantity'] += quantity
            holdings_summary[key]['total_cost'] += quantity * price
        elif transaction == 'SELL':
            holdings_summary[key]['quantity'] -= quantity
            # No restamos del costo para mantener el precio promedio de compra
        
        holdings_summary[key]['transactions'].append({
            'type': transaction,
            'quantity': quantity,
            'price': price,
            'timestamp': row['Timestamp']
        })
    
    # Insertar holdings consolidados
    inserted_count = 0
    for key, holding in holdings_summary.items():
        if holding['quantity'] <= 0:
            # Saltar posiciones que ya se vendieron completamente
            continue
        
        user_id = holding['user_id']
        symbol = holding['symbol']
        name = holding['name']
        quantity = holding['quantity']
        
        # Calcular precio promedio de compra
        purchase_price = holding['total_cost'] / quantity if quantity > 0 else 0
        
        # Valor actual (usamos el precio de compra como placeholder)
        current_value = quantity * purchase_price
        
        # Fecha de compra (primera transacción)
        purchase_date = holding['transactions'][0]['timestamp'] if holding['transactions'] else None
        if isinstance(purchase_date, str):
            try:
                purchase_date = datetime.fromisoformat(purchase_date.replace('Z', '+00:00')).date()
            except:
                purchase_date = None
        elif isinstance(purchase_date, pd.Timestamp):
            purchase_date = purchase_date.date()
        
        # Determinar tipo (stock o crypto)
        # Simplificación: si el símbolo contiene "BTC", "ETH", etc., es crypto
        asset_type = 'crypto' if any(crypto in symbol.upper() for crypto in ['BTC', 'ETH', 'USDT', 'BNB']) else 'stock'
        
        try:
            cursor.execute("""
                INSERT INTO holdings 
                (user_id, symbol, name, quantity, value, change, change_percent, purchase_price, purchase_date, type, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, (
                user_id,
                symbol,
                name,
                quantity,
                current_value,
                0,  # change (se actualizará con datos en tiempo real)
                0,  # change_percent
                purchase_price,
                purchase_date,
                asset_type
            ))
            inserted_count += 1
            
            # Mostrar progreso
            portfolio_name = [k for k, v in PORTFOLIO_MAPPING.items() if v == user_id][0]
            print(f"  ✓ {portfolio_name}: {symbol} - {quantity:.2f} unidades @ ${purchase_price:.2f}")
            
        except Exception as e:
            print(f"  ❌ Error insertando {symbol}: {e}")
    
    conn.commit()
    cursor.close()
    print(f"\n✅ Total de posiciones insertadas: {inserted_count}")

def calculate_portfolio_totals(conn):
    """Calcular y actualizar los totales de cada cartera"""
    cursor = conn.cursor()
    
    for portfolio_name, user_id in PORTFOLIO_MAPPING.items():
        try:
            # Sumar el valor total de todas las posiciones
            cursor.execute("""
                SELECT 
                    COALESCE(SUM(value), 0) as total_value,
                    COALESCE(SUM(CASE WHEN type = 'stock' THEN value ELSE 0 END), 0) as stocks_value,
                    COALESCE(SUM(CASE WHEN type = 'crypto' THEN value ELSE 0 END), 0) as crypto_value
                FROM holdings
                WHERE user_id = %s
            """, (user_id,))
            
            result = cursor.fetchone()
            total_value, stocks_value, crypto_value = result
            
            # Actualizar la tabla portfolio
            cursor.execute("""
                UPDATE portfolio
                SET total_value = %s,
                    stocks = %s,
                    crypto = %s,
                    updated_at = NOW()
                WHERE user_id = %s
            """, (total_value, stocks_value, crypto_value, user_id))
            
            print(f"✅ {portfolio_name}: Total=${total_value:.2f} (Stocks=${stocks_value:.2f}, Crypto=${crypto_value:.2f})")
            
        except Exception as e:
            print(f"❌ Error calculando totales para {portfolio_name}: {e}")
    
    conn.commit()
    cursor.close()

def main():
    print("🚀 Iniciando carga de carteras desde Excel...\n")
    
    # 1. Cargar datos del Excel
    excel_file = '/Users/francisco/Stoxy/stoxy_2025-12-08.xlsx'
    df = load_excel_data(excel_file)
    
    # 2. Conectar a la base de datos
    conn = connect_db()
    
    # 3. Crear las 3 carteras
    print("\n📁 Creando carteras...")
    create_portfolios(conn)
    
    # 4. Limpiar holdings existentes (opcional - comentar si quieres mantener datos previos)
    print("\n🗑️  Limpiando holdings existentes...")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM holdings WHERE user_id IN (1, 2, 3)")
    conn.commit()
    cursor.close()
    print("✅ Holdings limpiados")
    
    # 5. Cargar holdings
    print("\n📊 Cargando posiciones (holdings)...")
    load_holdings(conn, df)
    
    # 6. Calcular totales de cada cartera
    print("\n💰 Calculando totales de carteras...")
    calculate_portfolio_totals(conn)
    
    # 7. Cerrar conexión
    conn.close()
    
    print("\n✅ ¡Proceso completado exitosamente!")
    print("\n📋 Resumen:")
    print(f"   - Carteras creadas: {len(PORTFOLIO_MAPPING)}")
    print(f"   - Francisco (user_id: 1)")
    print(f"   - Jaime (user_id: 2)")
    print(f"   - Adela (user_id: 3)")

if __name__ == '__main__':
    main()
