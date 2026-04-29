terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
  required_version = ">= 1.3.0"
}

provider "azurerm" {
  features {}
}

# ─── VARIABLES ────────────────────────────────────────────────────────────────

variable "resource_group_name" {
  description = "Name of the Azure Resource Group"
  type        = string
  default     = "medical-rg-demo"
}

variable "location" {
  description = "Azure region for all resources"
  type        = string
  default     = "southeastasia"
}

variable "acr_name" {
  description = "Azure Container Registry name (must be globally unique, no hyphens)"
  type        = string
  default     = "medicalbillingpranaav"
}

variable "plan_name" {
  description = "App Service Plan name"
  type        = string
  default     = "medical-plan-demo"
}

variable "backend_app_name" {
  description = "Name of the backend Azure App Service"
  type        = string
  default     = "medical-backend-pranaav"
}

variable "frontend_app_name" {
  description = "Name of the frontend Azure App Service"
  type        = string
  default     = "medical-frontend-pranaav"
}

variable "mongo_uri" {
  description = "Azure Cosmos DB (MongoDB API) connection string"
  type        = string
  sensitive   = true
}

variable "frontend_url" {
  description = "Public HTTPS URL of the frontend App Service (used by backend CORS)"
  type        = string
  default     = "https://medical-frontend-pranaav.azurewebsites.net"
}


# ─── RESOURCE GROUP ───────────────────────────────────────────────────────────

resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
}


# ─── AZURE CONTAINER REGISTRY (ACR) ──────────────────────────────────────────

resource "azurerm_container_registry" "acr" {
  name                = var.acr_name
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = true   # required for App Service to pull with username/password

  tags = {
    project     = "medical-billing"
    environment = "production"
  }
}


# ─── APP SERVICE PLAN (Shared by both frontend & backend) ─────────────────────

resource "azurerm_service_plan" "plan" {
  name                = var.plan_name
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  os_type             = "Linux"
  sku_name            = "B1"   # Basic tier — upgrade to S1/P1v3 for production scale

  tags = {
    project     = "medical-billing"
    environment = "production"
  }
}


# ─── BACKEND APP SERVICE ──────────────────────────────────────────────────────
# Runs the Node.js/Express API container on port 8080
# Connects to Azure Cosmos DB via MONGO_URI env var

resource "azurerm_linux_web_app" "backend" {
  name                = var.backend_app_name
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  service_plan_id     = azurerm_service_plan.plan.id

  https_only = true

  site_config {
    always_on = true

    # Docker image pulled from ACR
    application_stack {
      docker_image_name        = "medical-backend:latest"
      docker_registry_url      = "https://${azurerm_container_registry.acr.login_server}"
      docker_registry_username = azurerm_container_registry.acr.admin_username
      docker_registry_password = azurerm_container_registry.acr.admin_password
    }
  }

  app_settings = {
    # Database
    MONGO_URI    = var.mongo_uri

    # CORS — allow the frontend origin
    FRONTEND_URL = var.frontend_url

    # Port — App Service passes PORT automatically; this ensures Docker exposes 8080
    WEBSITES_PORT = "8080"

    # ACR pull credentials (required so App Service can pull the image on restart)
    DOCKER_REGISTRY_SERVER_URL      = "https://${azurerm_container_registry.acr.login_server}"
    DOCKER_REGISTRY_SERVER_USERNAME = azurerm_container_registry.acr.admin_username
    DOCKER_REGISTRY_SERVER_PASSWORD = azurerm_container_registry.acr.admin_password

    # Enable detailed container logging
    DOCKER_ENABLE_CI = "true"
  }

  tags = {
    project     = "medical-billing"
    role        = "backend"
    environment = "production"
  }
}


# ─── FRONTEND APP SERVICE ─────────────────────────────────────────────────────
# Runs the React/Vite static build served via `serve` on port 8080
# VITE_API_URL is baked at build time — the container is pre-built

resource "azurerm_linux_web_app" "frontend" {
  name                = var.frontend_app_name
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  service_plan_id     = azurerm_service_plan.plan.id

  https_only = true

  site_config {
    always_on = true

    # Docker image pulled from ACR
    application_stack {
      docker_image_name        = "medical-frontend:latest"
      docker_registry_url      = "https://${azurerm_container_registry.acr.login_server}"
      docker_registry_username = azurerm_container_registry.acr.admin_username
      docker_registry_password = azurerm_container_registry.acr.admin_password
    }
  }

  app_settings = {
    # Port the container serves on
    WEBSITES_PORT = "8080"

    # ACR pull credentials
    DOCKER_REGISTRY_SERVER_URL      = "https://${azurerm_container_registry.acr.login_server}"
    DOCKER_REGISTRY_SERVER_USERNAME = azurerm_container_registry.acr.admin_username
    DOCKER_REGISTRY_SERVER_PASSWORD = azurerm_container_registry.acr.admin_password

    DOCKER_ENABLE_CI = "true"
  }

  tags = {
    project     = "medical-billing"
    role        = "frontend"
    environment = "production"
  }
}


# ─── OUTPUTS ──────────────────────────────────────────────────────────────────

output "acr_login_server" {
  description = "ACR login server URL (push images here)"
  value       = azurerm_container_registry.acr.login_server
}

output "backend_url" {
  description = "Public URL of the backend API"
  value       = "https://${azurerm_linux_web_app.backend.default_hostname}"
}

output "frontend_url" {
  description = "Public URL of the frontend app"
  value       = "https://${azurerm_linux_web_app.frontend.default_hostname}"
}

output "resource_group" {
  description = "Resource group containing all resources"
  value       = azurerm_resource_group.rg.name
}

output "app_service_plan" {
  description = "Shared App Service Plan"
  value       = azurerm_service_plan.plan.name
}
