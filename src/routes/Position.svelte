<script lang="ts">
  import type { Position } from '@prisma/client'
  export let data: Position

  const d = new Date(data.date)
</script>

<div class="position" />
