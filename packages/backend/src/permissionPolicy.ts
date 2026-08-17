
import { createBackendModule } from '@backstage/backend-plugin-api';
import {
  AuthorizeResult,
  PolicyDecision,
} from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyQuery,
  PolicyQueryUser,
} from '@backstage/plugin-permission-node';
import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';
import { catalogEntityDeletePermission } from '@backstage/plugin-catalog-common/alpha';

export class GroupPermissionPolicy implements PermissionPolicy {
  async handle(
    request: PolicyQuery,
    user?: PolicyQueryUser,
  ): Promise<PolicyDecision> {
    const userGroups = user?.info.ownershipEntityRefs ?? [];

    const isPlatformAdmin = userGroups.includes(
      'group:default/platform-engineering',
    );

    const isDeletePermission =
      request.permission.name === catalogEntityDeletePermission.name;

    // Only Platform Engineering can unregister/delete catalog entities
    if (isDeletePermission) {
      return {
        result: isPlatformAdmin
          ? AuthorizeResult.ALLOW
          : AuthorizeResult.DENY,
      };
    }

    return { result: AuthorizeResult.ALLOW };
  }
}

export default createBackendModule({
  pluginId: 'permission',
  moduleId: 'group-permission-policy',
  register(reg) {
    reg.registerInit({
      deps: {
        policy: policyExtensionPoint,
      },
      async init({ policy }) {
        policy.setPolicy(new GroupPermissionPolicy());
      },
    });
  },
});
