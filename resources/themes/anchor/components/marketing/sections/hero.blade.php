<section class="flex relative top-0 flex-col justify-center items-center -mt-24 w-full min-h-screen bg-[#F9F6F0] lg:min-h-screen border-b-4 border-[#111827]">
    <div class="flex flex-col flex-1 gap-12 justify-between items-center px-8 pt-32 mx-auto w-full max-w-2xl text-left md:px-12 xl:px-20 lg:pt-32 lg:pb-16 lg:max-w-7xl lg:flex-row">
        <!-- Text & Action Block -->
        <div class="w-full lg:w-1/2 flex flex-col justify-center">
            <!-- Bauhaus Badge -->
            <div class="inline-flex self-start items-center space-x-2 border-2 border-[#111827] bg-[#FFD100] px-3 py-1 text-xs font-mono font-extrabold uppercase mb-6 shadow-bauhaus">
                <span>FORM FOLLOWS FUNCTION</span>
            </div>
            <h1 class="text-5xl font-mono font-extrabold tracking-tighter text-left sm:text-6xl md:text-7xl lg:text-8xl text-[#111827] uppercase leading-none">
                AFTER<br><span class="text-[#E63946]">MEET</span>.io
            </h1>
            <p class="mt-6 text-xl font-mono font-bold text-[#111827] uppercase tracking-wide">
                A Modern Bauhaus CRM for Sales Teams.
            </p>
            <p class="mt-4 text-base font-medium text-[#111827]/70">
                Transforming chaotic workflows into structured geometric precision. Designed for modern high-velocity sales organizations who believe software should be as functional as it is beautiful.
            </p>
            <div class="flex flex-col gap-4 mt-8 md:flex-row">
                <a href="{{ route('register') }}" class="inline-flex justify-center items-center text-center text-base border-3 border-[#111827] shadow-bauhaus bg-[#E63946] text-white font-mono font-extrabold uppercase px-8 py-4 hover:bg-[#E63946]/90 hover:translate-y-0.5 transition-all">
                    START SELLING NOW
                </a>
                <a href="#features" class="inline-flex justify-center items-center text-center text-base border-3 border-[#111827] shadow-bauhaus bg-[#FFD100] text-[#111827] font-mono font-extrabold uppercase px-8 py-4 hover:bg-[#FFD100]/90 hover:translate-y-0.5 transition-all">
                    EXPLORE THE GRID
                </a>
            </div>
        </div>

        <!-- Bauhaus Interactive Graphic Canvas -->
        <div class="w-full lg:w-1/2 flex justify-center items-center mt-12 lg:mt-0">
            <div class="relative w-full max-w-[450px] aspect-square border-4 border-[#111827] bg-white shadow-bauhaus p-6 overflow-hidden flex flex-col justify-between">
                <!-- Grid background layer -->
                <div class="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#111827_1px,transparent_1px),linear-gradient(to_bottom,#111827_1px,transparent_1px)] bg-[size:20px_20px]"></div>

                <!-- Abstract Bauhaus Composition -->
                <div class="absolute w-[180px] h-[180px] rounded-full bg-[#E63946] border-4 border-[#111827] -top-10 -right-10 mix-blend-multiply opacity-90"></div>
                <div class="absolute w-[140px] h-[140px] bg-[#FFD100] border-4 border-[#111827] bottom-10 left-5 rotate-12 shadow-bauhaus"></div>
                <div class="absolute w-[200px] h-[60px] bg-[#1D3557] border-4 border-[#111827] top-1/2 left-1/4 -translate-y-1/2 -rotate-12 shadow-bauhaus"></div>
                <div class="absolute w-2 h-48 bg-[#111827] top-10 right-1/3"></div>

                <!-- Top content inside canvas -->
                <div class="relative z-10">
                    <span class="text-xs font-mono font-bold uppercase tracking-widest text-[#111827]">COMPOSITION #01</span>
                </div>

                <!-- Bottom content inside canvas -->
                <div class="relative z-10 self-start bg-white border-2 border-[#111827] p-3 shadow-bauhaus max-w-[280px]">
                    <span class="block text-sm font-mono font-extrabold text-[#111827] uppercase">SALES PIPELINE GEOMETRY</span>
                    <span class="block text-xs font-mono font-medium text-[#111827]/70 mt-1">100% mathematical precision & maximum velocity.</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Bauhaus Grid Foot Bar -->
    <div class="flex-shrink-0 flex border-t-4 border-[#111827] items-center w-full bg-[#FFD100]">
        <div class="grid grid-cols-1 divide-y-4 lg:divide-y-0 lg:divide-x-4 divide-[#111827] w-full lg:grid-cols-3">
            <div class="p-8 flex flex-col justify-between bg-white hover:bg-[#F9F6F0] transition-colors">
                <span class="text-3xl font-mono font-extrabold text-[#111827] block">01</span>
                <div>
                    <h3 class="font-mono font-extrabold text-lg text-[#111827] uppercase mt-4">FUNCTION FIRST</h3>
                    <p class="mt-2 text-sm text-[#111827]/70">
                        No fluff, no gradients, no useless noise. Only high-converting layouts designed to push deals through your pipeline with absolute focus.
                    </p>
                </div>
            </div>
            <div class="p-8 flex flex-col justify-between bg-[#F9F6F0] hover:bg-white transition-colors">
                <span class="text-3xl font-mono font-extrabold text-[#111827] block">02</span>
                <div>
                    <h3 class="font-mono font-extrabold text-lg text-[#111827] uppercase mt-4">LEAD VISUALIZATION</h3>
                    <p class="mt-2 text-sm text-[#111827]/70">
                        Map and manage your prospects inside a perfectly proportioned grid layout. Maximize your visibility of every active pipeline contract.
                    </p>
                </div>
            </div>
            <div class="p-8 flex flex-col justify-between bg-white hover:bg-[#F9F6F0] transition-colors">
                <span class="text-3xl font-mono font-extrabold text-[#111827] block">03</span>
                <div>
                    <h3 class="font-mono font-extrabold text-lg text-[#111827] uppercase mt-4">BAUHAUS VIBES</h3>
                    <p class="mt-2 text-sm text-[#111827]/70">
                        We define the Bauhaus philosophy as pure clarity, high contrast, and structural elegance. It is not just a style; it is the engine of productivity.
                    </p>
                </div>
            </div>
        </div>
    </div>
</section>
