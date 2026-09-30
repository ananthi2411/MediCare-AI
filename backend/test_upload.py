import urllib.request
import json
import uuid

boundary = '----WebKitFormBoundary' + uuid.uuid4().hex
lines = []

def add_field(name, value):
    lines.append(f'--{boundary}'.encode('utf-8'))
    lines.append(f'Content-Disposition: form-data; name="{name}"\r\n'.encode('utf-8'))
    lines.append(value.encode('utf-8'))

def add_file(name, filename, content, content_type='text/plain'):
    lines.append(f'--{boundary}'.encode('utf-8'))
    lines.append(f'Content-Disposition: form-data; name="{name}"; filename="{filename}"'.encode('utf-8'))
    lines.append(f'Content-Type: {content_type}\r\n'.encode('utf-8'))
    lines.append(content)

add_field('patient_name', 'Sundar Pichai')
add_field('report_type', 'Blood Test')
add_file('file', 'lab_report_sundar.pdf', b'%PDF-1.4 sample lab report blood test hemoglobin 14.5 normal', 'application/pdf')
lines.append(f'--{boundary}--\r\n'.encode('utf-8'))

body = b'\r\n'.join(lines)
req = urllib.request.Request('http://localhost:8000/upload-report', data=body)
req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')

try:
    resp = urllib.request.urlopen(req)
    data = json.loads(resp.read().decode('utf-8'))
    print('SUCCESS:', data.get('success'))
    print('DATA:', data.get('data'))
except Exception as e:
    print('ERROR:', e)
