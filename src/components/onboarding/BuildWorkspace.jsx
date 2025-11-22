import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoSmall from '../../assets/svgs/logo-small.svg';
import OutlineInput from '../textInputs/OutlineInput';
import PrimaryButton from '../buttons/PrimaryButton';
import { PATHS } from '../../routes/paths';
import { createWorkspaceApi } from '../../services/api';

function BuildWorkspace({ setCurrentScreen }) {
  const [workspaceName, setWorkspaceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setErrorMsg('');
    
    const trimmed = workspaceName.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a workspace name.');
      return;
    }

    try {
      setLoading(true);
      // POST { workspaceName }
      const res = await createWorkspaceApi({ workspaceName, subdomainName: "subdomain1" });

      const workspace = res?.data?.workspace || res?.workspace || { name: trimmed };
      localStorage.setItem('workspace', JSON.stringify(workspace));

      navigate(PATHS.DASHBOARD);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to create workspace. Please try again.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm relative">
      {/* top-left logo */}
      <img
        src={logoSmall}
        alt="logo"
        className="fixed top-10 left-10 z-50 pointer-events-none h-12 w-auto"
      />
      <div style={{ fontFamily: 'Gilroy-SemiBold', fontSize: 24 }} className="mt-20">
        Build your Workspace
      </div>

      <div className="mt-2 mb-8 text-[#BFBFBF]">
        Lorem ipsum dolor sit amet consectetur. Sed non at imperdiet non ornare sollicitudin vel.
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <OutlineInput
          label="Workspace Name (You can change this later)"
          type="text"
          placeholder="Enter your workspace name"
          name="workspaceName"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
        />

        {errorMsg && (
          <div className="text-[#FF8F8F] text-left text-sm">
            {errorMsg}
          </div>
        )}

        <div className="mt-8">
          <PrimaryButton
            type="submit"
            label="Create my workspace"
            loading={loading}
            disabled={loading || !workspaceName.trim()}
          />
        </div>
      </form>
    </div>
  );
}

export default BuildWorkspace;
