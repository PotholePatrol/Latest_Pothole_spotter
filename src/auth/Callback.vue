<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { useMessage } from "naive-ui";
import { refreshToken } from "../utils/index";
import { useUserStore } from "../store/userStore";

const router = useRouter();
const userStore = useUserStore();
const message = useMessage();

const loading = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const confusionToken = urlParams.get("token");

  if (!confusionToken) {
    error.value = "No token found in URL";
    message.warning(error.value);
    return;
  }

  try {
    loading.value = true;

    // Save token to store
    userStore.setUser({ id: confusionToken });

    // Optionally validate/refresh with backend
    await userStore.init();

    message.success("signed in successfully!");
  } catch (err: any) {
    error.value = err?.message || "Failed to initialize user";
    message.error(error.value);
  } finally {
    loading.value = false;
  }
});

// Redirect once username is set
watch(
  () => userStore.user?.email,
  (email) => {
    if (email) {
      router.push("/");
    }
  }
);
</script>


<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
    <n-card class="max-w-md w-full shadow-lg">
      <template #header>
        <h2 class="text-xl font-bold">Authenticating...</h2>
      </template>

      <div v-if="loading" class="text-center">
        <n-spin size="large" />
        <p class="mt-2">Exchanging token...</p>
      </div>

      <div v-else-if="realToken">
        <n-result
          status="success"
          title="Login Successful"
          description="You are now logged in!"
        />
      </div>

      <div v-else-if="error">
        <n-result
          status="error"
          title="Login Failed"
          :description="error"
        />
      </div>
    </n-card>
  </div>
</template>
