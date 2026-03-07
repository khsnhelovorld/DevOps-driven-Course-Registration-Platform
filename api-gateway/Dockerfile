# API Gateway: Nginx serves frontend static files and proxies /api/* to backend services.
# Frontend build is copied in during docker-compose build (see frontend stage in step 7).
FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf
# Placeholder until frontend is built; overwritten when using multi-stage or copy from frontend
RUN echo '<!DOCTYPE html><html><body>UIT-DKHP Gateway. Frontend will be served here.</body></html>' > /usr/share/nginx/html/index.html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
