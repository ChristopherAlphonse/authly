import * as React from 'react';

import {
 Section,
 Text,
} from '@react-email/components';

export const EmailFooter = () => {
  return (
     <Section className="border-t border-gray-200 pt-[24px] mt-[32px]">
              <Text className="text-[12px] text-gray-500 text-center m-0 mb-[8px]">
                Best regards,<br />
                The Team
              </Text>

              <Text className="text-[12px] text-gray-400 text-center m-0 mb-[8px]">
                123 Business St, Suite 100<br />
                City , State , 01234
              </Text>

              <Text className="text-[12px] text-gray-400 text-center m-0">

                © 2025 All rights reserved
              </Text>
            </Section>
  );
};
