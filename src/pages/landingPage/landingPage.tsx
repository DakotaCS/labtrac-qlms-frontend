/**
 * @author Dakota Soares
 * @version 1.1
 * @description Landing Page
 */

import React from 'react';
import './landingPage.css';
import Layout from '../../components/Layout/Layout';

const LandingPage: React.FC = () => {
  return (
      <Layout>
        <div className="landing-page">
          <h1>Welcome to LabTrac LMS</h1>
      </div>
    </Layout>
  );
};

export default LandingPage;
