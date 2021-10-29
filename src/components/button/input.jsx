import React from 'react';
import styled, {css} from "styled-components/macro";


const Button = styled.button`
  border-radius: 6px;
  font-family: Lato, sans-serif;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  border: none;
  position: relative;
  z-index: 1;
  padding: 0 20px 1px;
  transition: all 0.33s ease;
  font-size: 14px;
  line-height: 17px;
  height: 40px;
  ${({size})=>{
    switch (size){
        case 'Small':
            return css`
              font-size: 12px;
              line-height: 14px;
              height: 36px;
            `
        case 'Middle': return
        case 'Large':
            return css`
              font-size: 16px;
              line-height: 19px;
              height: 50px;
            `
        default:
            /**
             * Middle по Default
             */
            return
    }
}}
`;

export const Delete = styled(Button)`
  color: #fff;
  background: #DB4E46;
  &:hover {
    background: #BE3931;
  }
  /**
     До конца не понятно как будет работать,
     вроде как с начала слика до момента отработки функции будет показываться прелоадер в кнопке,
     по добавлению кнопки уточнить у Гены
   */
  &:active,
  &:active:focus {
  }
  
  ${({styled}) => styled}
`;

export const Background = styled(Button)`
  color: #0D2733;
  background: rgba(34, 44, 53, 0.1);
  &:hover {
    background: rgba(34, 44, 53, 0.17);
  }

  &:active,
  &:active:focus {
    background: rgba(34, 44, 53, 0.25);
  }
  
  ${({styled}) => styled}
`;

export const Invisible = styled(Button)`
  color: #0D2733;
  background: none;
  &:hover {
    background: #E4E4E4;
  }

  &:active,
  &:active:focus {
    background: #CBCDCF;
  }
  
  &:disabled:hover,
  &:disabled:focus{
    background: none;
    cursor: default;
  }
  
  &:disabled{
    background: none;
    color: #7E8387;
    cursor: default;
  }
  
  ${({styled}) => styled}
`;
export const Secondary = styled(Button)`
  background: #FFFFFF;
  border: 1px solid rgba(13, 39, 51, 0.15);
  color: #0D2733;
  
  &:hover {
    background: #E4E4E4;
  }

  &:active,
  &:active:focus {
    background: #CBCDCF;
  }
  
  &:disabled:hover,
  &:disabled:focus{
    background: none;
    cursor: default;
  }
  
  &:disabled{
    background: none;
    color: #7E8387;
    cursor: default;
  }
  
  ${({styled}) => styled}
`;

export const Primary = styled(Button)`
  background: #017EB1;
  color: #fff;
  &:hover {
    opacity: 1;
  }

  &:active{
    background: #02658E;
  }
  
  &:disabled:hover::before,
  &:active:hover::before,
  &:disabled:focus::before,
  &:active:focus::before{
    opacity: 0;
    cursor: default;
  }
  
  &:disabled{
    background: #D9D9D9;
    color: #7E8387;
    box-shadow: none;
    cursor: default;
  }
  &::before{
    content: '';
    box-sizing: border-box;
    position: absolute;
    border-radius: 6px;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: radial-gradient(50% 50% at 50% 50%, #67b2d0 0%, #017EB1 100%);
    z-index: -1;
    opacity: 0;
  }
  ${({styled}) => styled}
`;