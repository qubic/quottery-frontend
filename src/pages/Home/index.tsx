import { NavBar } from '../../components/NavBar';
import { Bets } from './Bets';

const Home = () => {
  return (
    <div className="flex flex-col gap-12">
      <NavBar hasLocker />

      <main className="mt-5 space-y-12">
        <div className="w-fit mx-auto text-center space-y-8">
          <div className="space-y-6">
            <h1 className="text-5xl font-medium">
              Bet on anything. <span className="text-cyan-500">Anytime.</span>
            </h1>

            <p className="text-white/50 text-lg">
              Quottery is p2p betting system
            </p>
          </div>

          <button className="px-4 py-2 text-cyan-500 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors">
            Create Bet
          </button>
        </div>

        <Bets />
      </main>
    </div>
  );
};

export default Home;
