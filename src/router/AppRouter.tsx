import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Loading } from '../components/Loading';

const Home = lazy(() => import('../pages/Home'));
const UnlockWallet = lazy(() => import('../pages/Unlock'));

const AppRouter = () => (
  <BrowserRouter basename="/">
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/unlock-wallet" element={<UnlockWallet />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export { AppRouter };
