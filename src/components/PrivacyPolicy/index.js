import React from "react";
import { Linking, ScrollView, Text } from "react-native";
import { B } from "../../../style";
import { AppName, Container, Subtitle, Title, Wrapper } from "../../style/TermsAndPrivacyStyle";
import { useToast } from "react-native-toast-notifications";
import { PRIVACY_CONTACT_EMAIL, PRIVACY_POLICY_URL } from "../../config/legal";
import qs from 'qs';

export default function PrivacyPolicy() {
    const { show } = useToast();

    async function sendEmail() {
        try {
            const to = PRIVACY_CONTACT_EMAIL;
            const body = 'Olá, \n\n Estou com dúvidas sobre as Políticas de Privacidade do Cante Uma Nova Canção,\n pode me ajudar ? \n\n Obrigado(a).';
            
            const query = qs.stringify({
                subject: 'Cante Uma Nova Canção',
                body,
                cc: '',
                bcc: ''
            });

            let url = `mailto:${to}?${query}`;

            const canOpen = await Linking.canOpenURL(url);

            if (!canOpen) {
                show('Não foi possível abrir o seu app de email', { type: 'danger' });
            }

            return Linking.openURL(url);

        } catch (error) {
            show('Ops! Houve um erro ao abrir o seu app de email', { type: 'danger' });
        }
    }

    const openPrivacyPolicy = () => Linking.openURL(PRIVACY_POLICY_URL);

    const goTo = (fun, value) => (
        <AppName isLink onPress={fun}>{value}</AppName>
    );

    return (
        <Container>
            <ScrollView>
                <Wrapper>
                    <Title>Política de Privacidade</Title>{"\n\n"}
                    <Text>
                        Esta tela resume como o aplicativo <AppName>"Cante Uma Nova Canção"</AppName> trata dados.
                        A versão pública e atualizada desta política está disponível em {goTo(openPrivacyPolicy, PRIVACY_POLICY_URL)}.
                    </Text>{"\n\n"}
                    <Subtitle>1. Dados tratados pelo aplicativo</Subtitle> {"\n\n"}
                    <Text>
                        O aplicativo não exige cadastro e não exibe anúncios.
                        O catálogo de músicas e o histórico de pesquisas ficam armazenados localmente no dispositivo.
                        Para estatísticas de uso, o Google Analytics for Firebase trata um identificador da instalação,
                        sessões, telas abertas, músicas reproduzidas, versão do aplicativo, versão do sistema operacional,
                        informações gerais do dispositivo e localização aproximada derivada da rede.
                        Não enviamos o texto pesquisado, e-mail, contato, localização precisa, User ID ou propriedades pessoais.
                    </Text>{"\n\n"}
                    <Subtitle>2. Acesso à internet</Subtitle>{"\n\n"}
                    <Text>
                        A conexão é usada para reproduzir ou baixar os áudios, abrir páginas externas solicitadas pelo usuário
                        e enviar os eventos estatísticos mínimos descritos acima.
                        Os provedores de hospedagem e de rede podem processar dados técnicos, como endereço IP e registros de acesso,
                        conforme suas próprias políticas.
                    </Text>{"\n\n"}
                    <Subtitle>3. Compartilhamento, retenção e exclusão</Subtitle>{"\n\n"}
                    <Text>
                        O aplicativo não envia o histórico de pesquisas nem o catálogo armazenado para o desenvolvedor.
                        Os dados estatísticos são processados pelo Google Analytics for Firebase para medição e melhoria do
                        aplicativo; não são vendidos, usados para anúncios ou para personalização publicitária.
                        O histórico pode ser apagado na própria tela de pesquisa. Os demais dados locais são removidos ao limpar
                        os dados do aplicativo ou desinstalá-lo.
                    </Text>{"\n\n"}
                    <Subtitle>4. Segurança de informações</Subtitle>{"\n\n"}
                    <Text>
                        Aplicamos medidas técnicas compatíveis com a natureza do aplicativo.
                        Nenhum sistema conectado à internet pode oferecer segurança absoluta.
                    </Text>{"\n\n"}
                    <Subtitle>5. Alterações na política de privacidade</Subtitle>{"\n\n"}
                    <Text>
                        Podemos atualizar esta Política de Privacidade a qualquer momento.
                        A versão pública indicada nesta tela é a fonte canônica e informará a data da última atualização.
                    </Text>{"\n\n"}
                    <Subtitle>6. Contato</Subtitle>{"\n\n"}
                    <Text>
                        Se você tiver alguma dúvida sobre esta Política de Privacidade,
                        entre em contato conosco pelo e-mail: {goTo(sendEmail, PRIVACY_CONTACT_EMAIL)}
                    </Text>
                    {"\n\n"}
                    <Text>
                        Resumo interno revisado em <B>Jul</B>/<B>2026</B>.
                    </Text>
                </Wrapper>
            </ScrollView>
        </Container>
    );
}
