import { AuthorizeResult, PolicyDecision } from '@backstage/plugin-permission-common';
import { PermissionPolicy, PolicyQuery, PolicyQueryUser } from '@backstage/plugin-permission-node';
import { catalogEntityDeletePermission } from '@backstage/plugin-catalog-common/alpha';

export class GroupPermissionPolicy implements PermissionPolicy {
  async handle(
    request: PolicyQuery,
    user?: PolicyQueryUser,
  ): Promise<PolicyDecision> {
    // Extract ownership entity references from PolicyQueryUser
    const userGroups = user?.info.ownershipEntityRefs || [];

    const isPlatformAdmin = userGroups.includes('group:default/platform-engineering');
    const isDeveloper = userGroups.includes('group:default/developers');

    // 1. Platform Engineering -> Full Admin Access
    if (isPlatformAdmin) {
      return { result: AuthorizeResult.ALLOW };
    }

    // 2. Developers -> Restricted Access
    if (isDeveloper) {
      // Prevent developers from unregistering/deleting entities from Catalog
      if (request.permission.name === catalogEntityDeletePermission.name) {
        return { result: AuthorizeResult.DENY };
      }
      return { result: AuthorizeResult.ALLOW };
    }

    // 3. Fallback Policy for Users in neither group
    if (request.permission.name === catalogEntityDeletePermission.name) {
      return { result: AuthorizeResult.DENY };
    }

    return { result: AuthorizeResult.ALLOW };
  }
}