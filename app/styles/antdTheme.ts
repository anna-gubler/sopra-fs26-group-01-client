import type { ThemeConfig } from 'antd';
import { colors } from './colors';

export const antdTheme: ThemeConfig = {
  token: {
    colorBgBase:          colors.bg2,
    colorBgContainer:     colors.bg3,
    colorBgElevated:      colors.bg4,
    colorBgLayout:        colors.bg1,
    colorBgSpotlight:     colors.bg5,
    colorBorder:          colors.border,
    colorBorderSecondary: colors.border2,
    colorText:            colors.text,
    colorTextSecondary:   colors.sub1,
    colorTextTertiary:    colors.sub0,
    colorTextQuaternary:  colors.muted,
    colorPrimary:         colors.primary,
    colorPrimaryHover:    colors.primaryHover,
    colorPrimaryActive:   colors.primaryDim,
    colorSuccess:         colors.emerald,
    colorWarning:         colors.amber,
    colorError:           colors.rose,
    colorInfo:            colors.violet,
    colorLink:            colors.primary,
    colorLinkHover:       colors.primaryHover,
    borderRadius:         8,
    borderRadiusLG:       12,
    borderRadiusSM:       5,
    fontFamily:           'var(--font-body), system-ui, -apple-system, sans-serif',
    fontSize:             14,
    lineHeight:           1.6,
    controlHeight:        38,
    controlHeightLG:      44,
  },
  components: {
    Layout: {
      bodyBg:    colors.bg1,
      headerBg:  colors.bg0,
      siderBg:   colors.bg1,
      triggerBg: colors.bg3,
    },
    Menu: {
      darkItemBg:            colors.bg1,
      darkSubMenuItemBg:     colors.bg0,
      darkItemSelectedBg:    colors.primaryBg,
      darkItemSelectedColor: colors.primary,
      darkItemColor:         colors.sub1,
      itemActiveBg:          colors.primaryBg,
      itemSelectedBg:        colors.primaryBg,
      itemSelectedColor:     colors.primary,
      itemHoverBg:           colors.bg4,
      itemHoverColor:        colors.text,
    },
    Card: {
      colorBgContainer:     colors.bg3,
      colorBorderSecondary: colors.border,
    },
    Button: {
      defaultBg:          'transparent',
      defaultBorderColor: colors.border2,
      defaultColor:       colors.sub1,
      primaryColor:       colors.bg0,
    },
    Input: {
      colorBgContainer:     colors.bg4,
      colorBorder:          colors.border2,
      activeBorderColor:    colors.primary,
      hoverBorderColor:     colors.border3,
      colorTextPlaceholder: colors.muted,
    },
    Select: {
      colorBgContainer: colors.bg4,
      colorBorder:      colors.border2,
      optionSelectedBg: colors.primaryBg,
      optionActiveBg:   colors.bg5,
    },
    Table: {
      colorBgContainer: colors.bg3,
      headerBg:         colors.bg1,
      borderColor:      colors.border,
      rowHoverBg:       colors.bg4,
    },
    Modal: {
      colorBgElevated: colors.bg4,
      colorBorder:     colors.border,
    },
    Drawer: {
      colorBgElevated: colors.bg3,
    },
    Tabs: {
      inkBarColor:       colors.primary,
      itemSelectedColor: colors.primary,
      itemHoverColor:    colors.sub1,
      itemColor:         colors.sub0,
      cardBg:            colors.bg3,
    },
    Tag: {
      defaultBg:    colors.bg5,
      defaultColor: colors.sub0,
    },
    Badge: {
      colorBgContainer: colors.bg4,
    },
    Tooltip: {
      colorBgSpotlight:    colors.bg5,
      colorTextLightSolid: colors.text,
    },
    Divider: {
      colorSplit: colors.border,
    },
    Slider: {
      colorPrimaryBorder:      colors.primaryDim,
      colorPrimaryBorderHover: colors.primary,
      trackBg:                 colors.primaryDim,
      trackHoverBg:            colors.primary,
      railBg:                  colors.bg6,
      railHoverBg:             colors.bg6,
    },
    Switch: {
      colorPrimary:      colors.primary,
      colorPrimaryHover: colors.primaryHover,
    },
    Progress: {
      colorSuccess:   colors.emerald,
      defaultColor:   colors.primary,
      remainingColor: colors.bg6,
    },
    Spin: {
      colorPrimary: colors.primary,
    },
    Skeleton: {
      color:            colors.bg4,
      colorGradientEnd: colors.bg5,
    },
    Notification: {
      colorBgElevated: colors.bg4,
    },
    Message: {
      colorBgElevated: colors.bg4,
    },
  },
};
