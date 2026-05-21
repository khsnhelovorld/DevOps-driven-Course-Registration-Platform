#!/bin/bash
set -e

echo "Opening Grafana..."
echo "URL: http://localhost:3000"
echo "Username: admin"
echo "Password: admin123"

kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80