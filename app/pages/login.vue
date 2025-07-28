<template>
  <div>
    <AuthLoginForm />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

useSeoMeta({
  title: 'Đăng nhập',
  description: 'Đăng nhập vào tài khoản MovieBooking để đặt vé xem phim online.'
})
</script>
