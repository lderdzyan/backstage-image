import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import { AuthorizeResult, PolicyDecision } from '@backstage/plugin-permission-common';
import { PermissionPolicy, PolicyQuery } from '@backstage/plugin-permission-node';
import { catalogEntityDeletePermission } from '@backstage/plugin-catalog-common/alpha';

export class GroupPermissionPolicy implements PermissionPolicy {
  async handle(
    request: PolicyQuery,
    user?: BackstageIdentityResponse,
  ): Promise<PolicyDecision> {
    const userGroups = user?.identity.ownershipEntityRefs || [];

    const isPlatformAdmin = userGroups.includes('group:default/platform-engineering');
    const isDeveloper = userGroups.includes('group:default/developers');

    // 1. Platform Engineering -> Full Admin
    if (isPlatformAdmin) {
      return { result: AuthorizeResult.ALLOW };
    }

    // 2. Developers -> Restricted (Cannot delete components from catalog)
    if (isDeveloper) {
      if (request.permission.name === catalogEntityDeletePermission.name) {
        return { result: AuthorizeResult.DENY };
      }
      return { result: AuthorizeResult.ALLOW };
    }

    // 3. Fallback -> Restrict sensitive catalog deletions
    if (request.permission.name === catalogEntityDeletePermission.name) {
      return { result: AuthorizeResult.DENY };
    }

    return { result: AuthorizeResult.ALLOW };
  }
}