# Kế hoạch Dự án: Triển khai Hệ thống Web Microservices hiệu năng cao trên AKS

## 1. Tổng quan Dự án
**Tên dự án:** Triển khai Hệ thống Web theo kiến trúc Microservices, có khả năng mở rộng, hiệu năng cao với Load Balancing và CI/CD trên Azure Kubernetes Service (AKS).

**Mục tiêu chính:**
- Chuyển đổi/Thiết kế hệ thống sang kiến trúc Microservices.
- Tự động hóa hoàn toàn việc cấp phát hạ tầng (IaC) và quy trình triển khai (CI/CD).
- Đảm bảo hệ thống chịu tải cao, có khả năng tự động mở rộng (Auto-scaling) và giám sát thời gian thực.

**Tech Stack:**
- **Ứng dụng:** Node.js/Python/Java (tùy thuộc vào code hiện tại), React/Vue cho Frontend.
- **Containerization:** Docker, Docker Compose.
- **Cloud Provider:** Microsoft Azure (AKS, ACR, Azure Database).
- **Infrastructure as Code (IaC):** Terraform.
- **Orchestration:** Kubernetes (K8s).
- **CI/CD:** GitHub Actions hoặc Azure DevOps.
- **Monitoring & Logging:** Prometheus, Grafana, ELK/EFK Stack hoặc Azure Monitor.
- **Testing:** K6 / JMeter (để load test).

---

## 2. Kiến trúc Hệ thống Dự kiến
1. **Frontend:** Chạy trên K8s pod hoặc lưu trữ trên Azure Blob Storage + CDN.
2. **API Gateway:** Điểm vào duy nhất, định tuyến request đến các Microservices (Nginx/Kong hoặc code tự viết).
3. **Microservices:** Các service độc lập (ví dụ: User Service, Course Service, v.v.).
4. **Database:** Tách biệt DB theo service hoặc dùng chung Cluster DB nhưng khác schema.
5. **Ingress Controller:** Quản lý traffic từ Internet vào cluster (Load Balancing).
6. **Registry:** Azure Container Registry (ACR) lưu trữ Docker image.

---

## 3. Lộ trình Triển khai Chi tiết (Phases)

### Giai đoạn 1: Chuẩn bị Source Code & Containerization
**Mục tiêu:** Ứng dụng chạy mượt mà trên môi trường local bằng Docker.
* **Task 1.1:** Rà soát kiến trúc ứng dụng, phân tách các Microservices rõ ràng (Frontend, API Gateway, Services, Database).
* **Task 1.2:** Viết `Dockerfile` tối ưu (Multi-stage build) cho từng service để giảm kích thước image.
* **Task 1.3:** Tạo file `docker-compose.yml` để chạy và liên kết tất cả các services kèm database ở dưới local.
* **Task 1.4:** Viết các API health-check (`/health`) cho từng service để K8s sử dụng sau này.

### Giai đoạn 2: Provisioning Hạ tầng bằng Terraform (IaC)
**Mục tiêu:** Hạ tầng Cloud được tạo hoàn toàn bằng code, có thể tái sử dụng.
* **Task 2.1:** Thiết lập Provider (AzureRM), cấu hình xác thực (Service Principal/Managed Identity) an toàn.
* **Task 2.2:** Viết module tạo Resource Group, Virtual Network (VNet), Subnets.
* **Task 2.3:** Viết module tạo Azure Container Registry (ACR) để lưu image.
* **Task 2.4:** Viết module tạo cluster Azure Kubernetes Service (AKS) tích hợp sẵn Role assignment cho phép AKS kéo image từ ACR.
* **Task 2.5:** Viết module tạo Database (Azure Database for PostgreSQL/MySQL) đảm bảo kết nối private/secure tới AKS.
* **Task 2.6:** Kiểm thử Terraform (`plan`, `apply`) và lưu state (Remote State trên Azure Storage Account).

### Giai đoạn 3: Viết Kubernetes Manifests & Load Balancing
**Mục tiêu:** Đưa ứng dụng chạy trên cluster AKS.
* **Task 3.1:** Viết file YAML (Deployment, Service) cho từng Microservice.
* **Task 3.2:** Quản lý cấu hình bằng ConfigMap và bảo mật thông tin nhạy cảm bằng Secret (hoặc Azure Key Vault).
* **Task 3.3:** Cài đặt Ingress Controller (Nginx Ingress) tạo Load Balancer công khai.
* **Task 3.4:** Cấu hình Ingress resource định tuyến traffic theo path hoặc domain (VD: `/api/users` -> User Service).
* **Task 3.5:** Tích hợp TLS/SSL certificate (sử dụng cert-manager và Let's Encrypt) cho HTTPS.

### Giai đoạn 4: Tự động hóa CI/CD
**Mục tiêu:** Code đẩy lên nhánh main sẽ tự động lên môi trường thật.
* **Task 4.1:** Viết pipeline CI (Continuous Integration): Lint code, chạy Unit Test, Build Docker image, đánh tag (versioning).
* **Task 4.2:** Tích hợp quét bảo mật image (Image scanning) trước khi push lên ACR.
* **Task 4.3:** Viết pipeline CD (Continuous Deployment): Update file K8s manifest với image tag mới và `kubectl apply` lên AKS cluster (hoặc dùng GitOps với ArgoCD).
* **Task 4.4:** Thiết lập các môi trường (Staging, Production) và approval flow nếu cần.

### Giai đoạn 5: Auto-scaling & Tối ưu Hiệu năng
**Mục tiêu:** Hệ thống tự động mở rộng khi chịu tải cao.
* **Task 5.1:** Cấu hình Resource Requests và Limits (CPU/RAM) cho từng Pod.
* **Task 5.2:** Bật Kubernetes Metrics Server trên AKS.
* **Task 5.3:** Thiết lập Horizontal Pod Autoscaler (HPA) cho các service quan trọng để tự tăng Pod khi CPU > 70%.
* **Task 5.4:** (Tùy chọn) Cấu hình Cluster Autoscaler để tự động tăng số lượng Node (VM) khi cluster hết tài nguyên.
* **Task 5.5:** Chạy Load Test bằng K6 hoặc JMeter để giả lập traffic lớn và chứng minh hệ thống chịu tải và scale thành công.

### Giai đoạn 6: Giám sát Hệ thống (Monitoring)
**Mục tiêu:** Theo dõi được "sức khỏe" hệ thống theo thời gian thực.
* **Task 6.1:** Triển khai Prometheus vào AKS cluster để thu thập metrics của Node, Pod, và ứng dụng.
* **Task 6.2:** Triển khai Grafana, kết nối với Prometheus và import/tạo các Dashboard giám sát (CPU, RAM, Network, Request Latency).
* **Task 6.3:** Cấu hình cảnh báo (Alertmanager): Gửi tin nhắn qua Slack/Telegram/Email khi có Pod bị crash hoặc CPU quá tải.
* **Task 6.4:** (Tùy chọn) Triển khai giải pháp tập trung Log (Loki hoặc ELK) để dễ dàng trace bug giữa các Microservices.

---

## 4. Kết quả Nghiệm thu (Acceptance Criteria)
1. Có repo code chứa cả source ứng dụng, K8s manifests và Terraform code.
2. Terraform có thể tạo/hủy toàn bộ hệ thống bằng 1 lệnh.
3. Pipeline CI/CD chạy xanh (Success), ứng dụng được cập nhật tự động lên cluster.
4. Truy cập được web qua tên miền, có HTTPS hợp lệ.
5. Khi Load Test, hệ thống không chết, số lượng Pod tự động sinh ra thêm để xử lý và giảm về bình thường khi ngưng test.
6. Dashboard Grafana hiển thị biểu đồ real-time và gửi được ít nhất 1 cảnh báo thử nghiệm.

---

## 5. Các rủi ro và cách khắc phục
- **Chi phí Cloud:** AKS, DB và Load Balancer trên Azure tốn tiền. Cần dùng script để tắt (stop) hoặc xóa cluster sau khi làm việc xong mỗi ngày bằng Terraform.
- **Networking/CORS:** Lỗi giao tiếp giữa các service do sai Ingress hoặc cấu hình CORS. Xử lý kĩ tại API Gateway và cấu hình Ingress.
- **Bảo mật:** Không commit các file chứa mật khẩu, connection string lên GitHub. Sử dụng `.env` và GitHub Secrets/Azure Key Vault.
