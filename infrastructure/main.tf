provider "azurerm" {
  features {}
}

locals {
  vaultName = "${var.product}-${var.env}"
}


module "probate-frontend-redis-cache" {
  source   = "git@github.com:hmcts/cnp-module-redis?ref=master"
  product  = "${var.product}-${var.component}-redis-cache"
  location = var.location
  env      = var.env
  common_tags  = var.common_tags
  private_endpoint_enabled = true
  redis_version = "6"
  business_area = "cft"
  public_network_access_enabled = false
}

data "azurerm_key_vault" "probate_key_vault" {
  name = local.vaultName
  resource_group_name = local.vaultName
}

resource "azurerm_key_vault_secret" "redis_access_key" {
  name         = "${var.component}-redis-access-key"
  value        = module.probate-frontend-redis-cache.access_key
  key_vault_id = data.azurerm_key_vault.probate_key_vault.id
}
