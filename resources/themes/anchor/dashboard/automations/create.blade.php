<x-layouts.app>
    <x-app.container class="lg:space-y-6">
        <div class="flex items-center justify-between pb-5 border-b border-zinc-200 dark:border-zinc-800">
            <x-app.heading
                title="Create Automation Workflow"
                description="Build a queue-driven headless automation workflow by defining its node sequence in JSON."
                :border="false"
            />
            <a href="{{ route('automations.index') }}" class="text-sm font-semibold text-zinc-600 hover:text-zinc-900">&larr; Back to Automations</a>
        </div>

        @if(session('error'))
            <div class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-zinc-800/50 dark:text-red-400" role="alert">
                <span class="font-medium">Error!</span> {{ session('error') }}
            </div>
        @endif

        <div class="mt-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <form action="{{ route('automations.store') }}" method="POST" class="space-y-6">
                @csrf
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Workflow Name</label>
                        <input type="text" name="name" value="{{ old('name') }}" class="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 rounded-lg p-2.5 text-sm" placeholder="e.g. Inbound Reply Sequence" required>
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Type</label>
                        <select name="type" class="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 rounded-lg p-2.5 text-sm" required>
                            <option value="action" {{ old('type') === 'action' ? 'selected' : '' }}>Action (e.g. outreach queue sequence)</option>
                            <option value="trigger" {{ old('type') === 'trigger' ? 'selected' : '' }}>Trigger (e.g. smart reply handler)</option>
                        </select>
                    </div>
                </div>

                <div>
                    <div class="flex items-center justify-between mb-1">
                        <label class="block text-sm font-bold text-zinc-700 dark:text-zinc-300">Workflow JSON Definition</label>
                        <span class="text-xs text-zinc-400">Must be valid JSON formatting.</span>
                    </div>
                    <textarea name="workflow_definition" rows="18" class="w-full font-mono text-xs border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg p-3" required>@if(old('workflow_definition')){{ old('workflow_definition') }}@else{
  "start_node_id": "send_initial",
  "nodes": {
    "send_initial": {
      "type": "SendEmailNode",
      "config": {
        "subject": "Hello @{{contact_name}}!",
        "body": "Hi @{{contact_name}},\n\nNice to meet you. Let's schedule a talk.\n\nBest,\nOur Team"
      },
      "next": "wait_3_days"
    },
    "wait_3_days": {
      "type": "DelayNode",
      "config": {
        "delay_days": 3
      },
      "next": null
    }
  }
}@endif</textarea>
                </div>

                <div class="pt-4 flex justify-end space-x-3 border-t border-zinc-200 dark:border-zinc-800">
                    <a href="{{ route('automations.index') }}" class="px-5 py-2 text-sm font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg">Cancel</a>
                    <button type="submit" class="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow">Create Workflow</button>
                </div>
            </form>
        </div>
    </x-app.container>
</x-layouts.app>
