variable "server_name" {
  type        = string
  description = "Name of the PostgreSQL Flexible Server"
}

variable "resource_group_name" {
  type        = string
}

variable "location" {
  type        = string
}

variable "vnet_id" {
  type        = string
  description = "Virtual Network ID for Private DNS Zone Link"
}

variable "db_subnet_id" {
  type        = string
  description = "Subnet ID delegated to Flexible Server"
}

variable "admin_user" {
  type        = string
  default     = "pgadmin"
}

variable "admin_password" {
  type        = string
  sensitive   = true
}

variable "db_name" {
  type        = string
  default     = "uit_dkhp"
}
