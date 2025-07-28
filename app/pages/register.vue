<template>
  <div>
    <AuthRegisterForm />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

useSeoMeta({
  title: 'Đăng ký',
  description: 'Tạo tài khoản MovieBooking miễn phí để đặt vé xem phim online.'
})
</script>
