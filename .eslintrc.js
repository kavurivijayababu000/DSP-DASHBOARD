module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Disable unused variables warning for placeholder/stub components
    "@typescript-eslint/no-unused-vars": ["error", { 
      "varsIgnorePattern": "^_",
      "argsIgnorePattern": "^_" 
    }],
    // Allow unused imports in development components
    "react-hooks/exhaustive-deps": "warn"
  },
  overrides: [
    {
      // Disable warnings for stub/placeholder files
      files: [
        "src/components/Dashboard/AdvancedAnalyticsTab.tsx",
        "src/components/Dashboard/GrievanceTab.tsx", 
        "src/components/Mobile/MobileDashboard.tsx",
        "src/components/Notifications/NotificationSystem.tsx",
        "src/components/PWA/PWAManager.tsx",
        "src/components/Profile/ProfileManagement.tsx",
        "src/components/Reports/DataExportReports.tsx",
        "src/components/Security/SecurityControls.tsx",
        "src/components/FileUpload/FileUploadComponent.tsx"
      ],
      rules: {
        "@typescript-eslint/no-unused-vars": "off",
        "react-hooks/exhaustive-deps": "off"
      }
    }
  ]
};
