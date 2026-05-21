# Monitoring

Thư mục này dùng để triển khai monitoring cho project **DevOps-driven Course Registration Platform** trên Kubernetes.

Monitoring stack sử dụng `kube-prometheus-stack`, bao gồm:
- Prometheus: thu thập metrics
- Grafana: hiển thị dashboard
- Alertmanager: quản lý cảnh báo
- kube-state-metrics: theo dõi trạng thái Kubernetes object
- node-exporter: theo dõi tài nguyên node
 
## Mục tiêu
Monitoring được triển khai để theo dõi các thành phần chính của hệ thống:
- Kubernetes nodes
- Pods
- Deployments
- Services
- CPU/Memory usage
- Pod restart count
- HPA status
- Trạng thái các service chính như `api-gateway`, `auth-service`, `course-service`, `registration-service`, `notification-service`, `redis`, `rabbitmq`

## Truy cập Grafana
Chạy: bash monitoring/scripts/port-forward-grafana.sh
## Sau đó mở: http://localhost:3000

## Tài khoản demo:
Username: admin
Password: admin123

## Kiểm tra trạng thái monitoring
kubectl get pods -n monitoring
kubectl get svc -n monitoring