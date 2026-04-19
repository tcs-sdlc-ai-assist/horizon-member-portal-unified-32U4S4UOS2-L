const getCareContent = {
  hero: {
    title: 'Get Care',
    subtitle: 'Find the right care at the right cost — whether in person, online, or over the phone.',
    description:
      'Use the resources below to search for providers, estimate costs, access telehealth services, and find behavioral health support.',
  },

  sections: [
    {
      id: 'find_care_cost',
      title: 'Find Care & Estimate Costs',
      icon: 'search',
      description:
        'Search for in-network doctors, specialists, hospitals, urgent care centers, and pharmacies. Use our cost estimator to understand what you may pay before your visit.',
      guidance:
        'Choosing an in-network provider helps you save money. Your Horizon Blue PPO Plus plan covers a wide range of providers across New Jersey and beyond.',
      links: [
        {
          id: 'find_doctor',
          label: 'Find a Doctor',
          description: 'Search for in-network primary care physicians and specialists near you.',
          url: 'https://www.horizonhealthcare.com/find-a-doctor',
          icon: 'user',
          isExternal: true,
        },
        {
          id: 'find_pharmacy',
          label: 'Find a Pharmacy',
          description: 'Locate in-network pharmacies for your prescriptions.',
          url: 'https://www.horizonhealthcare.com/find-a-pharmacy',
          icon: 'map-pin',
          isExternal: true,
        },
        {
          id: 'find_urgent_care',
          label: 'Find Urgent Care',
          description: 'Locate nearby urgent care centers for non-emergency conditions.',
          url: 'https://www.horizonhealthcare.com/find-urgent-care',
          icon: 'clock',
          isExternal: true,
        },
        {
          id: 'cost_estimator',
          label: 'Cost Estimator',
          description: 'Get an estimate of what you may owe for common procedures and services.',
          url: 'https://www.horizonhealthcare.com/cost-estimator',
          icon: 'dollar-sign',
          isExternal: true,
        },
        {
          id: 'provider_directory',
          label: 'Provider Directory',
          description: 'Browse the full Horizon PPO Network provider directory.',
          route: '/documents',
          icon: 'folder',
          isExternal: false,
        },
      ],
      tips: [
        'Always verify that your provider is in-network before scheduling an appointment.',
        'Preventive care visits are covered at 100% with in-network providers — no copay or deductible.',
        'Urgent care centers are a cost-effective alternative to the emergency room for non-life-threatening conditions.',
        'Use the cost estimator tool to compare prices across facilities before scheduling a procedure.',
      ],
    },
    {
      id: 'telemedicine',
      title: 'Telemedicine & Virtual Visits',
      icon: 'video',
      description:
        'See a doctor from the comfort of your home. Telehealth visits are available 24/7 for a wide range of conditions, from cold and flu symptoms to follow-up appointments and prescription refills.',
      guidance:
        'Your plan covers telehealth visits at a $10 copay with in-network providers. Virtual visits are a convenient and affordable way to get care without leaving home.',
      links: [
        {
          id: 'start_telehealth',
          label: 'Start a Telehealth Visit',
          description: 'Connect with a provider now via video or phone for immediate care.',
          url: 'https://www.horizonhealthcare.com/telehealth',
          icon: 'video',
          isExternal: true,
        },
        {
          id: 'telehealth_providers',
          label: 'Telehealth Providers',
          description: 'Browse providers who offer virtual visit options.',
          url: 'https://www.horizonhealthcare.com/find-a-doctor?telehealth=true',
          icon: 'search',
          isExternal: true,
        },
      ],
      coveredServices: [
        'Primary care virtual visits',
        'Specialist virtual consultations',
        'Behavioral health teletherapy',
        'Urgent care virtual visits',
        'Follow-up appointments',
        'Prescription refills and medication management',
        'Dermatology consultations',
        'Nutrition counseling',
      ],
      tips: [
        'Telehealth visits are available 24/7 — no appointment needed for urgent care virtual visits.',
        'Have your insurance ID card and a list of current medications ready before your visit.',
        'Telehealth copay is only $10 — less than an office visit or urgent care copay.',
        'You can use telehealth for follow-up visits after an in-person appointment.',
      ],
    },
    {
      id: 'behavioral_health',
      title: 'Behavioral Health & Mental Wellness',
      icon: 'heart',
      description:
        'Your mental health matters. Access therapy, counseling, psychiatric services, and substance abuse treatment through our behavioral health network. In-person and virtual options are available.',
      guidance:
        'Outpatient therapy visits are covered at a $25 copay with in-network providers. No referral is needed for behavioral health services under your PPO plan. Teletherapy is also available at the same copay.',
      links: [
        {
          id: 'find_therapist',
          label: 'Find a Therapist',
          description: 'Search for in-network therapists, counselors, and psychologists.',
          url: 'https://www.horizonhealthcare.com/find-a-doctor?specialty=behavioral-health',
          icon: 'heart',
          isExternal: true,
        },
        {
          id: 'crisis_resources',
          label: 'Crisis Resources',
          description: 'Immediate help for mental health emergencies and crisis situations.',
          url: 'https://www.horizonhealthcare.com/behavioral-health/crisis',
          icon: 'alert-circle',
          isExternal: true,
        },
        {
          id: 'substance_abuse',
          label: 'Substance Abuse Support',
          description: 'Find treatment programs and support for substance use disorders.',
          url: 'https://www.horizonhealthcare.com/behavioral-health/substance-abuse',
          icon: 'shield',
          isExternal: true,
        },
        {
          id: 'employee_assistance',
          label: 'Employee Assistance Program (EAP)',
          description: 'Confidential counseling and support services available through your employer.',
          url: 'https://www.horizonhealthcare.com/eap',
          icon: 'users',
          isExternal: true,
        },
      ],
      emergencyInfo: {
        title: 'If You Are in Crisis',
        message:
          'If you or someone you know is in immediate danger, call 911. For the Suicide & Crisis Lifeline, call or text 988. Help is available 24/7.',
        contacts: [
          {
            label: 'Emergency Services',
            phone: '911',
            description: 'For immediate life-threatening emergencies',
          },
          {
            label: 'Suicide & Crisis Lifeline',
            phone: '988',
            description: 'Call or text 24/7 for crisis support',
          },
          {
            label: 'Horizon Behavioral Health Line',
            phone: '1-800-555-0175',
            description: 'Member services for behavioral health questions',
          },
          {
            label: 'Crisis Text Line',
            phone: 'Text HOME to 741741',
            description: 'Free 24/7 crisis counseling via text',
          },
        ],
      },
      coveredServices: [
        'Individual psychotherapy',
        'Group therapy',
        'Psychiatric evaluation and medication management',
        'Substance abuse treatment (outpatient and inpatient)',
        'Teletherapy and virtual behavioral health visits',
        'Crisis intervention',
        'Family and couples counseling',
        'Applied behavior analysis (ABA) for autism spectrum disorder',
      ],
      tips: [
        'No referral is required for behavioral health services under your PPO plan.',
        'Teletherapy visits are covered at the same $25 copay as in-person therapy.',
        'Inpatient behavioral health services require prior authorization — call 1-800-555-0175.',
        'Your plan covers unlimited outpatient behavioral health visits per year.',
      ],
    },
  ],

  nurseLineInfo: {
    title: '24/7 Nurse Line',
    description:
      'Not sure if you need to see a doctor? Call our nurse line anytime, day or night, to speak with a registered nurse who can help you decide the best course of action.',
    phone: '1-800-555-0100',
    phoneDisplay: '1-800-555-0100',
    hours: '24 hours a day, 7 days a week',
    icon: 'phone',
    features: [
      'Speak with a registered nurse anytime',
      'Get guidance on symptoms and next steps',
      'Help deciding between urgent care, ER, or home care',
      'Available in English and Spanish',
      'No cost to you — included with your plan',
    ],
  },

  careGuidance: {
    title: 'Where Should I Go for Care?',
    description: 'Choosing the right care setting can save you time and money. Use this guide to help decide where to go.',
    options: [
      {
        id: 'telehealth',
        setting: 'Telehealth',
        copay: '$10',
        waitTime: 'Minutes',
        bestFor: 'Cold, flu, allergies, rashes, prescription refills, follow-ups',
        icon: 'video',
        recommendation: 'Best for minor conditions when you want fast, convenient care from home.',
      },
      {
        id: 'pcp_office',
        setting: 'Primary Care Office',
        copay: '$25',
        waitTime: 'Same day to a few days',
        bestFor: 'Routine checkups, chronic condition management, sick visits, preventive care',
        icon: 'user',
        recommendation: 'Your first stop for most health concerns. Build a relationship with your PCP for coordinated care.',
      },
      {
        id: 'specialist',
        setting: 'Specialist',
        copay: '$50',
        waitTime: 'Days to weeks',
        bestFor: 'Specific conditions requiring expert care (cardiology, orthopedics, dermatology, etc.)',
        icon: 'activity',
        recommendation: 'No referral needed with your PPO plan. Choose an in-network specialist to save.',
      },
      {
        id: 'urgent_care',
        setting: 'Urgent Care',
        copay: '$75',
        waitTime: 'Under 1 hour',
        bestFor: 'Minor injuries, sprains, cuts, mild illness, ear infections, minor burns',
        icon: 'clock',
        recommendation: 'A cost-effective alternative to the ER for non-life-threatening conditions.',
      },
      {
        id: 'emergency_room',
        setting: 'Emergency Room',
        copay: '$250 + 20% coinsurance',
        waitTime: 'Varies',
        bestFor: 'Chest pain, difficulty breathing, severe bleeding, head injuries, stroke symptoms',
        icon: 'alert-circle',
        recommendation: 'For life-threatening emergencies only. ER copay is waived if you are admitted to the hospital.',
      },
    ],
  },

  faqs: [
    {
      id: 'faq_1',
      question: 'Do I need a referral to see a specialist?',
      answer:
        'No. With your Horizon Blue PPO Plus plan, you do not need a referral to see a specialist. However, choosing an in-network specialist will help you save on out-of-pocket costs.',
    },
    {
      id: 'faq_2',
      question: 'What is the difference between urgent care and the emergency room?',
      answer:
        'Urgent care centers treat non-life-threatening conditions like minor injuries, cold and flu, and ear infections. The emergency room is for serious or life-threatening conditions such as chest pain, difficulty breathing, or severe injuries. Urgent care visits cost $75, while ER visits cost $250 plus 20% coinsurance after your deductible.',
    },
    {
      id: 'faq_3',
      question: 'How do I start a telehealth visit?',
      answer:
        'You can start a telehealth visit by clicking the "Start a Telehealth Visit" link above, which will connect you with an available provider via video or phone. Telehealth visits are available 24/7 and cost only $10 per visit.',
    },
    {
      id: 'faq_4',
      question: 'Are telehealth visits covered by my plan?',
      answer:
        'Yes. Telehealth visits with in-network providers are covered at a $10 copay. This includes primary care, specialist consultations, behavioral health, and urgent care virtual visits.',
    },
    {
      id: 'faq_5',
      question: 'How do I find out if a provider is in-network?',
      answer:
        'Use the "Find a Doctor" tool to search for in-network providers. You can also call Member Services at 1-800-555-0199 to verify a provider\'s network status before your appointment.',
    },
    {
      id: 'faq_6',
      question: 'What should I do in a mental health crisis?',
      answer:
        'If you or someone you know is in immediate danger, call 911. For the Suicide & Crisis Lifeline, call or text 988. You can also text HOME to 741741 to reach the Crisis Text Line. These services are free and available 24/7.',
    },
    {
      id: 'faq_7',
      question: 'Does my plan cover substance abuse treatment?',
      answer:
        'Yes. Your plan covers both outpatient and inpatient substance abuse treatment. Outpatient visits have a $25 copay with in-network providers. Inpatient treatment requires prior authorization. Call the Behavioral Health Line at 1-800-555-0175 for assistance.',
    },
    {
      id: 'faq_8',
      question: 'What is prior authorization and when do I need it?',
      answer:
        'Prior authorization is approval from Horizon Healthcare before you receive certain services. It is required for inpatient hospital stays, advanced imaging (MRI, CT, PET scans), outpatient surgery, inpatient behavioral health, and some specialty medications. Failure to obtain prior authorization may result in reduced benefits or denial of coverage.',
    },
    {
      id: 'faq_9',
      question: 'Can I use the 24/7 Nurse Line for medical advice?',
      answer:
        'Yes. The 24/7 Nurse Line (1-800-555-0100) connects you with a registered nurse who can help you assess symptoms, decide where to seek care, and provide general health guidance. There is no cost for this service.',
    },
    {
      id: 'faq_10',
      question: 'How can I estimate my costs before a procedure?',
      answer:
        'Use the Cost Estimator tool to get an estimate of what you may owe for common procedures and services. The estimate is based on your plan benefits, deductible status, and the provider you choose. You can access the tool from the "Find Care & Estimate Costs" section above.',
    },
  ],

  quickContacts: [
    {
      id: 'member_services',
      label: 'Member Services',
      phone: '1-800-555-0199',
      hours: 'Monday – Friday, 8:00 AM – 8:00 PM ET',
      icon: 'phone',
    },
    {
      id: 'nurse_line',
      label: '24/7 Nurse Line',
      phone: '1-800-555-0100',
      hours: '24/7',
      icon: 'heart',
    },
    {
      id: 'behavioral_health_line',
      label: 'Behavioral Health Line',
      phone: '1-800-555-0175',
      hours: 'Monday – Friday, 8:00 AM – 8:00 PM ET',
      icon: 'heart',
    },
    {
      id: 'pharmacy_help',
      label: 'Pharmacy Help Desk',
      phone: '1-800-555-0180',
      hours: 'Monday – Friday, 8:00 AM – 8:00 PM ET',
      icon: 'map-pin',
    },
    {
      id: 'prior_auth',
      label: 'Prior Authorization',
      phone: '1-800-555-0150',
      hours: 'Monday – Friday, 8:00 AM – 6:00 PM ET',
      icon: 'clipboard',
    },
    {
      id: 'crisis_line',
      label: 'Suicide & Crisis Lifeline',
      phone: '988',
      hours: '24/7',
      icon: 'alert-circle',
    },
  ],
}

export default getCareContent