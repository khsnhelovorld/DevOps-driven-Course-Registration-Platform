output "db_server_name" {
  value = azurerm_postgresql_flexible_server.postgres.name
}

output "db_server_fqdn" {
  value = azurerm_postgresql_flexible_server.postgres.fqdn
}
