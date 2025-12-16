map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}
upstream odoo {
    # odoo http服务 启动：python odoo-bin gevent
    server 192.168.0.30:8068;
}
upstream odoochat {
    # odoo websocket服务 启动：python odoo-bin --proxy-mode
    server 192.168.0.30:8072;
}
upstream emr {
    server 192.168.0.30:8088;
}
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name odoows.tbird.com;
    ssl_certificate /etc/nginx/ssl/odoows.tbird.com_P256/fullchain.cer;
    ssl_certificate_key /etc/nginx/ssl/odoows.tbird.com_P256/private.key;
    # 增加超时时间
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 600s;
    gzip_types text/css text/scss text/plain text/xml application/xml application/json application/javascript;
    gzip on;
    location ~ /.well-known/acme-challenge {
        proxy_set_header Host $host;
        proxy_set_header X-Real_IP $remote_addr;
        proxy_set_header X-Forwarded-For $remote_addr:$remote_port;
        proxy_pass http://127.0.0.1:9180;
    }
    # 转发EMR前端、后端以及网关ws
    location /emr/ {
        proxy_pass http://emr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $host;
        proxy_redirect / /index/;
    }
    location /emr/dev-api/ {
        # 移除/dev-api/前缀
        rewrite ^/emr/dev-api/(.*)$ /$1 break;
        proxy_pass http://192.168.0.30:8181;
        proxy_redirect / /emr/;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $host;
    }
    # emr-WebSocket 代理配置
    location /emr/ws {
        proxy_pass http://192.168.0.30:8181/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        # 可选：传递原始IP和协议
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    # 超时设置（根据需要调整）
    # proxy_read_timeout 60s;
    # proxy_send_timeout 60s;
    # Redirect websocket requests to odoo gevent port
    # odoo ws配置
    location /websocket/ {
        proxy_pass http://odoochat;
        # WebSocket协议升级所需的HTTP头
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Forwarded-Host $http_host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Real-IP $remote_addr;
    }
    # add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    # proxy_cookie_flags session_id samesite=lax secure;
    # Redirect requests to odoo backend server
    location / {
        proxy_pass http://odoo;
        # Add Headers for odoo proxy mode
        proxy_set_header X-Forwarded-Host $http_host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Real-IP $remote_addr;
    }
}