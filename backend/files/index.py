import json
import os
import base64
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
import boto3

s3 = boto3.client('s3',
    endpoint_url='https://bucket.poehali.dev',
    aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
    aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
)

def handler(event: dict, context) -> dict:
    '''API для загрузки, получения списка и управления файлами пользователя'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    try:
        token = event.get('headers', {}).get('x-authorization', '').replace('Bearer ', '')
        
        if not token:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unauthorized'})
            }
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        user = verify_token(conn, token)
        
        if not user:
            conn.close()
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid token'})
            }
        
        if method == 'GET':
            result = get_user_files(conn, user['id'])
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            result = upload_file(conn, user['id'], body)
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            result = archive_file(conn, user['id'], body)
        else:
            result = {'error': 'Method not allowed'}
        
        conn.close()
        
        return {
            'statusCode': 200 if 'error' not in result else 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result, default=str)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }


def verify_token(conn, token: str):
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute(
        "SELECT u.* FROM users u JOIN sessions s ON u.id = s.user_id WHERE s.session_token = %s AND s.expires_at > CURRENT_TIMESTAMP",
        (token,)
    )
    user = cursor.fetchone()
    cursor.close()
    return user


def get_user_files(conn, user_id: int) -> dict:
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute(
        "SELECT id, file_name, file_size, file_type, uploaded_at, is_archived, storage_path FROM files WHERE user_id = %s ORDER BY uploaded_at DESC",
        (user_id,)
    )
    files = cursor.fetchall()
    cursor.close()
    
    cdn_base = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/"
    
    return {
        'files': [
            {
                'id': f['id'],
                'name': f['file_name'],
                'size': f['file_size'],
                'type': f['file_type'],
                'uploaded': f['uploaded_at'].isoformat(),
                'archived': f['is_archived'],
                'url': cdn_base + f['storage_path']
            }
            for f in files
        ]
    }


def upload_file(conn, user_id: int, body: dict) -> dict:
    file_name = body.get('fileName')
    file_data = body.get('fileData')
    file_type = body.get('fileType', 'application/octet-stream')
    
    if not file_name or not file_data:
        return {'error': 'fileName and fileData required'}
    
    try:
        file_bytes = base64.b64decode(file_data)
    except:
        return {'error': 'Invalid base64 data'}
    
    file_size = len(file_bytes)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    storage_path = f"files/{user_id}/{timestamp}_{file_name}"
    
    s3.put_object(
        Bucket='files',
        Key=storage_path,
        Body=file_bytes,
        ContentType=file_type
    )
    
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute(
        "INSERT INTO files (user_id, file_name, file_size, file_type, storage_path) VALUES (%s, %s, %s, %s, %s) RETURNING *",
        (user_id, file_name, file_size, file_type, storage_path)
    )
    file_record = cursor.fetchone()
    conn.commit()
    cursor.close()
    
    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{storage_path}"
    
    return {
        'success': True,
        'file': {
            'id': file_record['id'],
            'name': file_record['file_name'],
            'size': file_record['file_size'],
            'type': file_record['file_type'],
            'url': cdn_url,
            'uploaded': file_record['uploaded_at'].isoformat()
        }
    }


def archive_file(conn, user_id: int, body: dict) -> dict:
    file_id = body.get('fileId')
    
    if not file_id:
        return {'error': 'fileId required'}
    
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE files SET is_archived = true WHERE id = %s AND user_id = %s",
        (file_id, user_id)
    )
    conn.commit()
    affected = cursor.rowcount
    cursor.close()
    
    if affected == 0:
        return {'error': 'File not found'}
    
    return {'success': True}
