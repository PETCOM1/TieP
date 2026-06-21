import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { LandingPage } from '../pages/LandingPage';
import { DashboardPage } from '../pages/DashboardPage';
import { LessonsPage } from '../pages/LessonsPage';
import { PracticePage } from '../pages/PracticePage';
import { TestPage } from '../pages/TestPage';
import { ResultsPage } from '../pages/ResultsPage';
import { GamesPage } from '../pages/GamesPage';

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="lessons" element={<LessonsPage />} />
          <Route path="practice" element={<PracticePage />} />
          <Route path="test" element={<TestPage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="games" element={<GamesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
