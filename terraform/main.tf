resource "azurerm_resource_group" "rg" {
  name     = "devops-rg"
  location = "Southeast Asia"
}

resource "azurerm_kubernetes_cluster" "aks" {

  name                = "devops-aks"
  location            = azurerm_resource_group.rg.location

  resource_group_name = azurerm_resource_group.rg.name

  dns_prefix          = "devopsaks"

  default_node_pool {
    name       = "default"
    node_count = 2
    vm_size    = "Standard_B2s"
  }

  identity {
    type = "SystemAssigned"
  }

}

