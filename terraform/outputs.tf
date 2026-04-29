output "resource_group_name" {
  value = azurerm_resource_group.rg.name
}

output "aks_cluster_name" {
  value = module.aks.cluster_name
}

output "vnet_id" {
  value = module.vnet.vnet_id
}

output "acr_login_server" {
  value = module.acr.acr_login_server
}

output "db_server_fqdn" {
  value = module.database.db_server_fqdn
}