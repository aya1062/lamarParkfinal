
# Nginx Configuration for Large File Uploads

إذا كنت تستخدم Nginx كـ reverse proxy أمام الـ Node.js server، يجب إضافة هذه الإعدادات في ملف `nginx.conf`:

```nginx
server {
    listen 80;
    server_name api.lamarparks.com;

    # زيادة الحد الأقصى لحجم الطلب
    client_max_body_size 200M;
    
    # زيادة timeout للطلبات الكبيرة
    client_body_timeout 300s;
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;
    
    # Buffer settings
    client_body_buffer_size 128k;
    proxy_buffering off;
    proxy_request_buffering off;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '$http_origin' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With, Accept, Origin' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '$http_origin' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With, Accept, Origin' always;
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
}
```

بعد التعديل، أعد تحميل Nginx:
```bash
sudo nginx -t  # للتحقق من صحة الإعدادات
sudo systemctl reload nginx  # أو sudo service nginx reload
```






