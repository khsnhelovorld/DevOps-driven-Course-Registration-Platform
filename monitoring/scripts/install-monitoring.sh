#!/bin/bash

set -e

echo "Adding prometheus-community Helm repo..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

echo "Creating monitoring namespace..."
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -

echo "Installing kube-prometheus-stack..."
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  -f monitoring/helm/kube-prometheus-stack-values.yaml \
  --wait

echo "Monitoring stack installed successfully."
echo "Run this command to open Grafana:"
echo "bash monitoring/scripts/port-forward-grafana.sh"
