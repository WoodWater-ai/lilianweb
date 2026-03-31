# PRD Update: Multi-Tenant Architecture & Permissions

## 1. Overview
This update introduces a multi-tenant architecture to support a three-tier structure: Super Admin -> Channel -> Secondary Tenant. This allows for better isolation and management of resources across different organizational levels.

## 2. Key Concepts
- **Super Admin (系统超级管理员):** Has full access to all channels and tenants. Manages global settings and channel creation.
- **Channel (渠道):** Represents a top-level organizational unit (e.g., a regional branch or a large distributor). Managed by Channel Admins.
- **Secondary Tenant (二级租户):** Represents a sub-unit under a channel (e.g., a specific store or a smaller partner). Managed by Secondary Tenant Admins.
- **Role Scope (作用域):** Roles are now defined by their scope:
  - **Channel Level (渠道级):** Roles applicable only within the current channel.
  - **Tenant Level (租户级):** Roles that can be assigned to users within secondary tenants.

## 3. Page Modifications

### 3.1 Accounts Management (`/accounts`)
- **Table Columns:** Added "Name / Phone" (combined), "Account Type" (渠道管理员, 二级租户管理员, 普通员工), "Tenant Label" (所属租户).
- **Filters:** Added search by Name/Phone, Role, Account Type, and Status.
- **Add Account Modal:**
  - Added "Name" field.
  - Added "Account Type" dropdown.
  - Added conditional "Tenant Label" field (visible only when Account Type is "二级租户管理员").
- **Logic:** `handleAddSubmit` updated to handle new fields and assign default tenant labels based on account type.

### 3.2 Roles Management (`/roles`)
- **Table Columns:** Replaced "Type" with "Role Scope" (作用域) and "Role Type" (角色类型 - 系统内置/自定义).
- **Filters:** Added filter by "Role Scope" (渠道级/租户级).
- **Add/Edit Role Modal:**
  - Added "Role Scope" dropdown (渠道级/租户级).
- **Logic:** Role creation and editing now include the `roleType` field.

## 4. New Pages (Planned)
- **`Channels.tsx`:** For Super Admins to manage top-level channels.
- **`TenantRelations.tsx`:** For Super Admins to view the hierarchy of channels and tenants.
- **`SubTenants.tsx`:** For Channel Admins to manage their secondary tenants.

## 5. Shared Components (Planned)
- **`AssignToTenantModal.tsx`:** A reusable modal for assigning resources (products, packages, secrets) to specific secondary tenants.

## 6. Future Integration
- **Products, Packages, Secrets:** Add "Assignment Status" columns and integrate `AssignToTenantModal`.
- **Orders:** Add "Channel Ownership" and "Secondary Tenant Ownership" columns, plus tenant filters.
