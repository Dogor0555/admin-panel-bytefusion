import React from "react";
import styled from "styled-components";

interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder = "Buscar..." }) => {
  return (
    <StyledWrapper>
      <div id="poda">
        <div className="glow" />
        <div className="darkBorderBg" />
        <div className="darkBorderBg" />
        <div className="darkBorderBg" />
        <div className="white" />
        <div className="border" />
        <div id="main">
          <input
            className="input"
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
          />
          <div id="pink-mask" />
          <div className="filterBorder" />
          <div id="filter-icon">
            <svg
              fill="none"
              viewBox="4.8 4.56 14.832 15.408"
              width={27}
              height={27}
              preserveAspectRatio="none"
            >
              <path
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeMiterlimit={10}
                strokeWidth={1}
                stroke="#d6d6e6"
                d="M8.16 6.65002H15.83C16.47 6.65002 16.99 7.17002 16.99 7.81002V9.09002C16.99 9.56002 16.7 10.14 16.41 10.43L13.91 12.64C13.56 12.93 13.33 13.51 13.33 13.98V16.48C13.33 16.83 13.1 17.29 12.81 17.47L12 17.98C11.24 18.45 10.2 17.92 10.2 16.99V13.91C10.2 13.5 9.97 12.98 9.73 12.69L7.52 10.36C7.23 10.08 7 9.55002 7 9.20002V7.87002C7 7.17002 7.52 6.65002 8.16 6.65002Z"
              />
            </svg>
          </div>
          <div id="search-icon">
            <svg
              className="feather feather-search"
              fill="none"
              height={24}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              viewBox="0 0 24 24"
              width={24}
            >
              <circle cx={11} cy={11} r={8} stroke="url(#search)" />
              <line x1={22} x2="16.65" y1={22} y2="16.65" stroke="url(#searchl)" />
              <defs>
                <linearGradient id="search" gradientTransform="rotate(50)">
                  <stop offset="0%" stopColor="#f8e7f8" />
                  <stop offset="50%" stopColor="#b6a9b7" />
                </linearGradient>
                <linearGradient id="searchl">
                  <stop offset="0%" stopColor="#b6a9b7" />
                  <stop offset="50%" stopColor="#837484" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  #poda {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .input {
    background-color: #f2e2c4;
    color: #3a2e20;
    border: none;
    width: 300px;
    height: 56px;
    border-radius: 10px;
    padding-inline: 59px;
    font-size: 18px;
  }
  .input::placeholder {
    color: #857754;
  }
  .input:focus {
    outline: none;
  }
  #pink-mask {
    pointer-events: none;
    width: 30px;
    height: 20px;
    position: absolute;
    background: #f28e8e;
    top: 10px;
    left: 5px;
    filter: blur(20px);
    opacity: 0.8;
    transition: all 2s;
  }
  #main {
    position: relative;
    font-family: "Courier New", Courier, monospace;
  }
  #search-icon {
    position: absolute;
    left: 20px;
    top: 15px;
    color: #c98f65;
  }
`;

export default SearchInput;