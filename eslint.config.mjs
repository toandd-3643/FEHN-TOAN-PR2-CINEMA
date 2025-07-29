// eslint.config.js
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  // Các features bạn muốn enable/disable
})
.append({
  rules: {
    // ✅ Cho phép sử dụng any
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    
    // Hoặc warning thay vì error
    // '@typescript-eslint/no-explicit-any': 'warn',
  }
})
