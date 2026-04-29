variable "resource_group_name" {
  type = string
}

variable "location" {
  type = string
}

variable "cluster_name" {
  type    = string
  default = "devops-aks"
}

variable "dns_prefix" {
  type    = string
  default = "devopsaks"
}

variable "node_count" {
  type    = number
  default = 2
}

variable "vm_size" {
  type    = string
  default = "Standard_B2s"
}

variable "vnet_subnet_id" {
  type = string
}
