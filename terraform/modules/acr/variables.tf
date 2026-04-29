variable "acr_name" {
  type        = string
  description = "Name of the Azure Container Registry"
}

variable "resource_group_name" {
  type        = string
  description = "Name of the Resource Group"
}

variable "location" {
  type        = string
  description = "Location for the ACR"
}

variable "sku" {
  type        = string
  default     = "Basic"
  description = "SKU of the ACR"
}
