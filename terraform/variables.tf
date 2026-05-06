variable "resource_group_name" {
  type    = string
  default = "uit-dkhp-rg"
}

variable "location" {
  type    = string
  default = "Southeast Asia"
}

variable "acr_name" {
  type    = string
  default = "uitdkhpacr2026"
}

variable "db_server_name" {
  type    = string
  default = "uit-dkhp-pg-server"
}

variable "db_admin_user" {
  type    = string
  default = "pgadmin"
}

variable "db_admin_password" {
  type      = string
  sensitive = true
}
