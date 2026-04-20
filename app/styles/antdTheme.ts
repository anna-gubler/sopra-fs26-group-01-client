import type { ThemeConfig } from 'antd';
import { colors } from './colors';

export const antdTheme: ThemeConfig = {
  token: {
    colorBgBase:            colors.bg2,
    colorBgContainer:       colors.bg3,
    colorBgElevated:        colors.bg4,
    colorBorder:            colors.border,
    colorBorderSecondary:   colors.border2,
    colorText:              colors.text,
    colorTextSecondary:     colors.sub1,
    colorTextTertiary:      colors.sub0,
    colorTextDisabled:      colors.muted,
    colorPrimary:           colors.primary,
    colorPrimaryHover:      colors.primaryHover,
    colorError:             colors.error,
    colorWarning:           colors.warning,
    colorSuccess:           colors.complete,
    colorLink:              colors.primary,
    colorLinkHover:         colors.primaryHover,
    borderRadius:           6,
    fontFamily:             'var(--font-body)',
  },
  components: {
    Button: {
      colorPrimary:       colors.primary,
      colorPrimaryHover:  colors.primaryHover,
      defaultBg:          colors.bg4,
      defaultBorderColor: colors.border2,
    },
    Input: {
      colorBgContainer:  colors.bg4,
      colorBorder:       colors.border,
      activeBorderColor: colors.primary,
      hoverBorderColor:  colors.border3,
    },
    Select: {
      colorBgContainer: colors.bg4,
      optionSelectedBg: colors.primaryBg,
    },
    Table: {
      colorBgContainer: colors.bg3,
      headerBg:         colors.bg4,
      rowHoverBg:       colors.bg5,
    },
    Card: {
      colorBgContainer:     colors.bg3,
      colorBorderSecondary: colors.border,
    },
    Modal: {
      contentBg: colors.bg1,
      headerBg:  colors.bg1,
    },
  },
};
