#!/bin/bash
set -e

echo "Checking current Kubernetes context..."
kubectl config current-context

echo "Checking monitoring pods..."
kubectl get pods -n monitoring

echo "Checking monitoring services..."
kubectl get svc -n monitoring

echo "Checking app pods..."
kubectl get pods

echo "Checking app services..."
kubectl get svc

echo "Checking HPA..."
kubectl get hpa