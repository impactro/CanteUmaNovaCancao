import styled from "styled-components/native";

export const Container = styled.View`
    flex: 1;
    width: 100%;
`;

export const Wrapper = styled.View`
    align-items: center;
    align-self: center;
    width: 100%;
    max-width: 680px;
    padding: 24px 20px 36px;
`;

export const BrandImage = styled.Image`
    width: 176px;
    height: 176px;
    margin-bottom: 8px;
`;

export const Description = styled.Text`
    width: 100%;
    margin-bottom: 24px;
    text-align: left;
    padding: 20px;
    font-size: 16px;
    line-height: 24px;
    color: ${props => props.theme.color};
    background-color: ${props => props.theme.modalColor};
    border-radius: 20px;
`;

export const Actions = styled.View`
    width: 100%;
    max-width: 420px;
`;

export const AboutButton = styled.Pressable`
    width: 100%;
    min-height: 48px;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    padding: 12px 20px;
    margin-bottom: 12px;
    background-color: ${props => props.theme.colors.primary};
`;

export const ContainerModal = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
    background-color: #0000002b;
`;

export const ModalWrapper = styled.View`
    margin: 20px;
    background-color: #9f9f9f;
    border-radius: 20px;
    padding: 35px;
    align-items: center;
    minWidth: 80%;
`;

export const ModalTitle = styled.Text`
    margin-bottom: 15px;
    text-align: center;
    font-size: 18px;
    font-weight: 700;
    color: #ffff;
`;

export const ModalContent = styled.View`
    display: flex;
    align-items: stretch;
    flex-direction: column;
`;

export const VersionApp = styled.Text`
    width: 100%;
    color: #ffff;
    text-align: center;
    line-height: 21px;
    padding: 18px;
    margin-top: 36px;
    background-color: #3B3B3B;
    border-radius: 16px;
    overflow: hidden;
`;
