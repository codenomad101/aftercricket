import LiveScores from '@/components/LiveScores';

export default function LiveScoresPage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-light-blue to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h1 className="text-5xl font-black text-dark-brown mb-4 font-papyrus">
                        Live Cricket Scores
                    </h1>
                    <p className="text-xl text-gray-600">
                        Stay updated with real-time cricket scores from around the world
                    </p>
                </div>

                <LiveScores />
            </div>
        </main>
    );
}
