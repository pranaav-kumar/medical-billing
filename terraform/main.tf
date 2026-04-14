provider "azurerm" {
  features {}

  resource_provider_registrations = "none"
}

resource "azurerm_resource_group" "rg" {
  name     = "medical-rg"
  location = "Southeast Asia"
}

resource "azurerm_container_registry" "acr" {
  name                = "medicalbillingacrpranaav"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = true
}

resource "azurerm_service_plan" "plan" {
  name                = "medical-plan"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  os_type             = "Linux"
  sku_name            = "B1"
}

resource "azurerm_linux_web_app" "backend" {
  name                = "medical-backend-app-pranaav"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  service_plan_id     = azurerm_service_plan.plan.id

  site_config {
    application_stack {
      docker_image_name        = "${azurerm_container_registry.acr.login_server}/medical-backend:latest"
      docker_registry_url      = "https://${azurerm_container_registry.acr.login_server}"
      docker_registry_username = azurerm_container_registry.acr.admin_username
      docker_registry_password = azurerm_container_registry.acr.admin_password
    }
  }

  app_settings = {
    WEBSITES_PORT = "8080"
  }
}

