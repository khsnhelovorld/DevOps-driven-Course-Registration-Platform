#!/bin/bash
# Script to install Kube-Prometheus-Stack (Prometheus, Grafana, Alertmanager)
# This implements Phase 6 of the project plan.

echo "Adding prometheus-community helm repo..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

echo "Creating monitoring namespace..."
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -

echo "Installing kube-prometheus-stack into monitoring namespace..."
# We use a default password "admin123" for Grafana, but this can be overridden
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set grafana.adminPassword=admin123 \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false \
  --wait

echo ""
echo "========================================================="
echo "✅ Monitoring stack installed successfully!"
echo "========================================================="
echo "To access Grafana, run:"
echo "kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80"
echo "Then visit http://localhost:3000 in your browser."
echo "Login with user: admin | password: admin123"
echo "========================================================="
