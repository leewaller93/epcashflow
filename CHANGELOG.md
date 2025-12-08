# Changelog

## [2025-12-05] - Monthly Breakdown Calculator, Account Fields, and New Contract Button

### Added

#### 1. Monthly Breakdown Calculator
- **Location**: `frontend/src/components/ContractForm.js`
- **Feature**: When "Monthly" invoice type is selected, a new calculator section appears
- **Functionality**:
  - Two calculation modes:
    - **TCV → Monthly Amount**: Enter Total Contract Value and number of months, calculates monthly amount
    - **Monthly Amount → TCV**: Enter monthly amount and number of months, calculates TCV
  - Auto-calculates end date from start date and number of months
  - Automatically syncs calculated dates with main form's start/end date fields
  - Real-time calculations as user types
  - Summary display showing payment breakdown

#### 2. Add New Contract Button
- **Location**: `frontend/src/components/ContractsList.js`, `frontend/src/App.js`
- **Feature**: Added "Add New Contract" button on Contracts list page
- **Functionality**:
  - Button appears in top-right corner of contracts list
  - Navigates to new contract form (same functionality as home screen)
  - Allows creating new contracts directly from contracts list page

#### 3. Account Name and Account Number Fields
- **Location**: 
  - Backend: `backend/app.py`
  - Frontend: `frontend/src/components/ContractForm.js`
- **Feature**: Added account fields for future CRM integration
- **Functionality**:
  - **account_name**: Visible field in contract form (optional, not required)
  - **account_number**: Hidden field stored in database (not visible in UI, reserved for CRM)
  - Database migration automatically adds columns to existing databases
  - Backend API endpoints updated to handle both fields

### Modified Files

1. **frontend/src/components/ContractForm.js**
   - Added monthly breakdown state and calculation logic
   - Added date calculation functions for monthly breakdown
   - Added account_name and account_number to form state
   - Added account_name input field to UI
   - Added monthly breakdown calculator UI section

2. **frontend/src/components/ContractsList.js**
   - Added `onAddNewContract` prop
   - Added "Add New Contract" button in header

3. **frontend/src/App.js**
   - Added `handleAddNewContract` function
   - Passed `onAddNewContract` prop to ContractsList component

4. **backend/app.py**
   - Added database migration for `account_name` and `account_number` columns
   - Updated POST `/api/contracts` endpoint to handle account fields
   - Updated PUT `/api/contracts/<project_id>` endpoint to handle account fields

### Database Changes

- Added `account_name TEXT` column to contracts table
- Added `account_number TEXT` column to contracts table
- Migration runs automatically on backend startup (safe for existing databases)

### Technical Details

**Commit Hash**: b6a9ef5 (if you need to revert, use: `git revert b6a9ef5` or `git checkout b6a9ef5~1`)

**To Revert These Changes**:
```bash
# View the commit
git show b6a9ef5

# Revert the commit (creates a new commit that undoes changes)
git revert b6a9ef5

# Or reset to before this commit (destructive - use with caution)
git reset --hard b6a9ef5~1
```

### Notes

- Monthly breakdown calculator only appears when "Monthly" invoice type is selected
- Account fields are optional and not required for contract creation
- account_number is stored but not displayed - reserved for future CRM integration
- All changes are backward compatible with existing contracts

