<x-layouts.app>
    <div id="ai-email-template-builder-root" class="min-h-screen"></div>

    <script>
        window.realProspects = @json($prospects);
    </script>

    <x-slot name="javascript">
        @vite(['resources/themes/anchor/dashboard/templates/ai_email_template_builder.tsx'])
    </x-slot>
</x-layouts.app>
