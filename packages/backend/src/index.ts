/*
 * Hi!
 *
 * Note that this is an EXAMPLE Backstage backend. Please check the README.
 *
 * Happy hacking!
 */

import { createBackend } from '@backstage/backend-defaults';
import { createBackendModule } from '@backstage/backend-plugin-api';
import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';
import { GroupPermissionPolicy } from './permissionPolicy';

const backend = createBackend();

// -------------------------------------------------------------
// App & Core Plugins
// -------------------------------------------------------------
backend.add(import('@backstage/plugin-app-backend'));
backend.add(import('@backstage/plugin-proxy-backend'));

// Scaffolder Plugin
backend.add(import('@backstage/plugin-scaffolder-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));
backend.add(
  import('@backstage/plugin-scaffolder-backend-module-notifications'),
);

// TechDocs Plugin
backend.add(import('@backstage/plugin-techdocs-backend'));

// Auth Plugin
backend.add(import('@backstage/plugin-auth-backend'));
backend.add(import('@backstage/plugin-auth-backend-module-microsoft-provider'));

// Catalog Plugin & Modules
backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(
  import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
);
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));
backend.add(import('@backstage/plugin-catalog-backend-module-msgraph'));

// -------------------------------------------------------------
// Permission Plugin & Custom Group Policy
// -------------------------------------------------------------
// REMOVED: plugin-permission-backend-module-allow-all-policy
backend.add(import('@backstage/plugin-permission-backend'));

const customPermissionModule = createBackendModule({
  pluginId: 'permission',
  moduleId: 'group-policy',
  register(reg) {
    reg.registerInit({
      deps: { policy: policyExtensionPoint },
      async init({ policy }) {
        policy.setPolicy(new GroupPermissionPolicy());
      },
    });
  },
});

backend.add(customPermissionModule);

// -------------------------------------------------------------
// Search Plugin
// -------------------------------------------------------------
backend.add(import('@backstage/plugin-search-backend'));
backend.add(import('@backstage/plugin-search-backend-module-pg'));
backend.add(import('@backstage/plugin-search-backend-module-catalog'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs'));

// -------------------------------------------------------------
// Other Plugins
// -------------------------------------------------------------
backend.add(import('@backstage/plugin-kubernetes-backend'));
backend.add(import('@backstage/plugin-user-settings-backend'));
backend.add(import('@backstage/plugin-notifications-backend'));
backend.add(import('@backstage/plugin-signals-backend'));
backend.add(import('@backstage/plugin-mcp-actions-backend'));

// Start the Backend
backend.start();