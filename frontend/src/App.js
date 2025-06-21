import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import './App.css';

import Home from './pages/Home';
import Auth from './pages/Auth';
import AccountHome from './pages/account/AccountHome'
import EntryEditor from './pages/account/entries/EntryEditor';
import EntryView from './pages/account/entries/EntryView';
import EntriesList from './pages/account/entries/EntriesList';
import Emotions from './pages/account/Emotions';
import Profile from './pages/social/profile/Profile';
import Settings from './pages/account/Settings';
import PrivacyPolicy from './pages/PrivacyPolicy';
import UserAgreement from './pages/UserAgreement';
import About from './pages/About';
import Social from './pages/social/social';
import UserProfile from './pages/social/UserProfile';
import { HelmetProvider } from 'react-helmet-async';

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <UserProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/user-agreement" element={<UserAgreement />} />
              <Route path="/about" element={<About />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/account/home" element={<AccountHome />} />
              <Route path="/account/entry/:id" element={<EntryView />} />
              <Route path="/account/entries" element={<EntriesList />} />
              <Route path="/account/entries/:id/edit" element={<EntryEditor />} />
              <Route path="/account/new-entry" element={<EntryEditor />} />
              <Route path="/account/emotions" element={<Emotions />} />
              <Route path="/account/profile" element={<Profile />} />
              <Route path="/profile/:username" element={<Profile />} />
              <Route path="/account/settings" element={<Settings />} />
              <Route path="/social" element={<Social />} />
              <Route path="/social/user/:username" element={<UserProfile />} />
            </Routes>
          </Router>
        </UserProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
