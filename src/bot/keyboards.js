const getMainMenu = () => ({
    inline_keyboard: [
      [{ text: '🎁 AWS', callback_data: 'aws' }],
      [{ text: '🎁 Buy', callback_data: 'buy' }],
    ],
  });
  
  const getVcpuMenu = () => ({
    inline_keyboard: [
      [{ text: '5 vCPU', callback_data: '5vcpu' }],
      [{ text: '8 vCPU', callback_data: '8vcpu' }],
      [{ text: '32 vCPU', callback_data: '32vcpu' }],
      [{ text: '64 vCPU', callback_data: '64vcpu' }],
    ],
  });
  
  module.exports = { getMainMenu, getVcpuMenu };